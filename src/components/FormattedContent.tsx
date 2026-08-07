// Convierte el mini-formato de texto usado en /admin/terminos en JSX:
//   "## Título"  -> <h2>
//   "- texto"    -> <li> dentro de <ul>
//   línea en blanco -> separa bloques de texto (párrafos)
type Block =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

function parseContent(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      blocks.push({ type: "paragraph", text: currentParagraph.join("\n") });
      currentParagraph = [];
    }
  }
  function flushList() {
    if (currentList.length > 0) {
      blocks.push({ type: "list", items: currentList });
      currentList = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.slice(3).trim() });
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      flushParagraph();
      currentList.push(line.slice(2).trim());
    } else if (line === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      currentParagraph.push(line);
    }
  }
  flushParagraph();
  flushList();

  return blocks;
}

export default function FormattedContent({ content }: { content: string }) {
  const blocks = parseContent(content);

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="text-xl font-semibold mt-8 mb-1 first:mt-0">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="list-disc pl-6 text-[var(--muted)] space-y-1">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[var(--muted)] whitespace-pre-line">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
