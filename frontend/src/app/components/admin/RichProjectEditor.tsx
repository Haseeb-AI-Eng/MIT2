import { useRef, useState, type ReactNode } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  Link as LinkIcon, FileUp, Eye, PencilLine, Trash2, Undo2,
} from 'lucide-react';
import { Button } from '../ui/button';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type Props = {
  value: string;
  onChange: (value: string) => void;
};

type ToolbarAction = 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'bullet' | 'numbered' | 'quote' | 'link';

function normalizeText(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

function htmlToMarkdown(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (!(node instanceof HTMLElement)) return '';

    const inner = Array.from(node.childNodes).map(walk).join('');
    const tag = node.tagName.toLowerCase();
    if (tag === 'h1') return `\n# ${inner.trim()}\n`;
    if (tag === 'h2') return `\n## ${inner.trim()}\n`;
    if (tag === 'h3' || tag === 'h4') return `\n### ${inner.trim()}\n`;
    if (tag === 'strong' || tag === 'b') return `**${inner.trim()}**`;
    if (tag === 'em' || tag === 'i') return `*${inner.trim()}*`;
    if (tag === 'a') return `[${inner.trim()}](${node.getAttribute('href') || '#'})`;
    if (tag === 'blockquote') return `\n${inner.trim().split('\n').map((line) => `> ${line}`).join('\n')}\n`;
    if (tag === 'li') {
      const ordered = node.parentElement?.tagName.toLowerCase() === 'ol';
      const index = ordered ? Array.from(node.parentElement?.children || []).indexOf(node) + 1 : 0;
      return `\n${ordered ? `${index}.` : '-'} ${inner.trim()}`;
    }
    if (tag === 'p' || tag === 'div') return `\n${inner.trim()}\n`;
    if (tag === 'br') return '\n';
    return inner;
  };

  return normalizeText(Array.from(doc.body.childNodes).map(walk).join(''));
}

async function extractPdf(file: File) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map<number, { chunks: Array<{ x: number; text: string }>; sizes: number[] }>();

    for (const raw of content.items as any[]) {
      if (!raw?.str?.trim()) continue;
      const y = Math.round(raw.transform?.[5] || 0);
      const x = Number(raw.transform?.[4] || 0);
      const size = Math.abs(raw.transform?.[3] || 12);
      const row = rows.get(y) || { chunks: [], sizes: [] };
      row.chunks.push({ x, text: raw.str });
      row.sizes.push(size);
      rows.set(y, row);
    }

    const ordered = [...rows.entries()].sort((a, b) => b[0] - a[0]);
    const sizes = ordered.flatMap(([, row]) => row.sizes).sort((a, b) => a - b);
    const median = sizes[Math.floor(sizes.length / 2)] || 12;

    const lines = ordered.map(([, row]) => {
      const text = row.chunks.sort((a, b) => a.x - b.x).map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim();
      const average = row.sizes.reduce((a, b) => a + b, 0) / Math.max(row.sizes.length, 1);
      const headingLike = text.length > 0 && text.length < 110 && !/[.!?]$/.test(text);
      if (headingLike && average >= median * 1.35) return `# ${text}`;
      if (headingLike && average >= median * 1.14) return `## ${text}`;
      return text;
    });
    pages.push(lines.join('\n'));
  }
  return normalizeText(pages.join('\n\n'));
}

async function extractDocument(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'docx') {
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    return htmlToMarkdown(result.value);
  }
  if (extension === 'pdf') return extractPdf(file);
  if (['txt', 'md', 'markdown'].includes(extension || '')) return normalizeText(await file.text());
  throw new Error('Supported documents: PDF, DOCX, TXT, MD and MARKDOWN.');
}

function inlinePreview(text: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\)]+\))/g);
  return tokens.map((token, index) => {
    const bold = token.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={index}>{bold[1]}</strong>;
    const italic = token.match(/^\*(.+)\*$/);
    if (italic) return <em key={index}>{italic[1]}</em>;
    const link = token.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="font-semibold underline">{link[1]}</a>;
    return <span key={index}>{token}</span>;
  });
}

function renderPreview(markdown: string) {
  const lines = markdown.split('\n');
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let numbers: string[] = [];

  const flush = () => {
    if (bullets.length) {
      blocks.push(<ul key={`b-${blocks.length}`} className="list-disc space-y-1.5 pl-6">{bullets.map((item, i) => <li key={i}>{inlinePreview(item)}</li>)}</ul>);
      bullets = [];
    }
    if (numbers.length) {
      blocks.push(<ol key={`n-${blocks.length}`} className="list-decimal space-y-1.5 pl-6">{numbers.map((item, i) => <li key={i}>{inlinePreview(item)}</li>)}</ol>);
      numbers = [];
    }
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) { flush(); return; }
    if (/^[-*•]\s+/.test(line)) { bullets.push(line.replace(/^[-*•]\s+/, '')); return; }
    if (/^\d+\.\s+/.test(line)) { numbers.push(line.replace(/^\d+\.\s+/, '')); return; }
    flush();
    if (line.startsWith('### ')) blocks.push(<h3 key={index}>{inlinePreview(line.slice(4))}</h3>);
    else if (line.startsWith('## ')) blocks.push(<h2 key={index}>{inlinePreview(line.slice(3))}</h2>);
    else if (line.startsWith('# ')) blocks.push(<h1 key={index}>{inlinePreview(line.slice(2))}</h1>);
    else if (line.startsWith('> ')) blocks.push(<blockquote key={index}>{inlinePreview(line.slice(2))}</blockquote>);
    else blocks.push(<p key={index}>{inlinePreview(line)}</p>);
  });
  flush();
  return blocks;
}

export function RichProjectEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [importing, setImporting] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [previousValue, setPreviousValue] = useState('');

  const apply = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || 'text';
    let replacement = selected;
    if (action === 'bold') replacement = `**${selected}**`;
    if (action === 'italic') replacement = `*${selected}*`;
    if (action === 'h1') replacement = `# ${selected.replace(/^#+\s*/, '')}`;
    if (action === 'h2') replacement = `## ${selected.replace(/^#+\s*/, '')}`;
    if (action === 'h3') replacement = `### ${selected.replace(/^#+\s*/, '')}`;
    if (action === 'quote') replacement = selected.split('\n').map((line) => `> ${line}`).join('\n');
    if (action === 'bullet') replacement = selected.split('\n').map((line) => `- ${line.replace(/^[-*•]\s*/, '')}`).join('\n');
    if (action === 'numbered') replacement = selected.split('\n').map((line, i) => `${i + 1}. ${line.replace(/^\d+\.\s*/, '')}`).join('\n');
    if (action === 'link') replacement = `[${selected}](https://example.com)`;
    setPreviousValue(value);
    onChange(`${value.slice(0, start)}${replacement}${value.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    });
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    setImporting(true);
    try {
      const imported = await extractDocument(file);
      setPreviousValue(value);
      onChange(imported);
      setDocumentName(file.name);
      setMode('edit');
    } catch (error: any) {
      window.alert(error?.message || 'Unable to import document.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toolbar = [
    ['bold', Bold, 'Bold'], ['italic', Italic, 'Italic'], ['h1', Heading1, 'Main heading'],
    ['h2', Heading2, 'Section heading'], ['h3', Heading3, 'Small heading'], ['bullet', List, 'Bullet list'],
    ['numbered', ListOrdered, 'Numbered list'], ['quote', Quote, 'Quote'], ['link', LinkIcon, 'Link'],
  ] as const;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {toolbar.map(([action, Icon, label]) => (
            <button key={action} type="button" title={label} onClick={() => apply(action)} className="rounded-lg p-2 text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm">
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <button type="button" title="Undo last editor action" disabled={!previousValue} onClick={() => { const current = value; onChange(previousValue); setPreviousValue(current); }} className="rounded-lg p-2 text-slate-600 transition hover:bg-white disabled:opacity-30">
            <Undo2 className="h-4 w-4" />
          </button>
          <span className="mx-1 h-6 w-px bg-slate-300" />
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md,.markdown" hidden onChange={(e) => importFile(e.target.files?.[0])} />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing} className="gap-2 bg-white">
            <FileUp className="h-4 w-4" /> {importing ? 'Importing…' : 'Import document'}
          </Button>
          {documentName && <span className="max-w-[240px] truncate rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700" title={documentName}>{documentName}</span>}
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button type="button" onClick={() => setMode('edit')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${mode === 'edit' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}><PencilLine className="h-3.5 w-3.5" /> Edit</button>
          <button type="button" onClick={() => setMode('preview')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${mode === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}><Eye className="h-3.5 w-3.5" /> Preview</button>
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={'Write project content or import a PDF/DOCX document.\n\n# Project Overview\n## Research Areas\n- Computer Vision\n- Deep Learning\n\nUse **bold text** where needed.'}
          className="min-h-[430px] w-full resize-y border-0 bg-white p-6 font-mono text-[14px] leading-7 text-slate-900 outline-none" />
      ) : (
        <div className="project-rich-preview min-h-[430px] space-y-4 p-7 text-slate-800">
          {value.trim() ? renderPreview(value) : <p className="text-slate-400">Nothing to preview yet.</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500">
        <span>PDF/DOCX content is converted into editable project text. Use headings and lists for clean website formatting.</span>
        <button type="button" onClick={() => { setPreviousValue(value); onChange(''); setDocumentName(''); }} className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /> Clear content</button>
      </div>
    </div>
  );
}
