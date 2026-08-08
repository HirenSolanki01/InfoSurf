import React, { useState } from "react";
import { 
  Database, Cpu, FileText, Search, ShieldCheck, 
  ArrowRight, Sparkles, Layers, Code, CheckCircle 
} from "lucide-react";

const RagPipelineVisual = () => {
  const [selectedNode, setSelectedNode] = useState(0);

  const pipelineNodes = [
    {
      id: "ingestion",
      label: "Raw Sources",
      icon: FileText,
      tech: "PyPDF · BeautifulSoup · YouTube API",
      title: "Heterogeneous Data Ingestion",
      details: "Raw streams from PDFs, HTML pages, GitHub code archives, and YouTube transcripts are parsed and normalized into clean UTF-8 text.",
      codeSnippet: "text = parse_pdf(file_bytes) or parse_web_url(url)"
    },
    {
      id: "chunking",
      label: "Text Chunking",
      icon: Layers,
      tech: "RecursiveCharacterTextSplitter",
      title: "Context-Preserving Segmentation",
      details: "Documents are split into 600-character segments with a 60-character sliding overlap to maintain semantic continuity across boundaries.",
      codeSnippet: "splitter = RecursiveCharacterTextSplitter(chunk_size=600, overlap=60)"
    },
    {
      id: "embedding",
      label: "Embeddings",
      icon: Cpu,
      tech: "all-MiniLM-L6-v2 (384-dim)",
      title: "Dense Semantic Vectorization",
      details: "Chunks are projected into 384-dimensional dense vector representations locally via SentenceTransformers without external latency.",
      codeSnippet: "vector = model.encode(chunk).tolist()  # 384 dimensions"
    },
    {
      id: "vectordb",
      label: "Vector Store",
      icon: Database,
      tech: "Qdrant Vector Database",
      title: "Local Persistent Storage",
      details: "Vectors and rich JSON payloads are stored in local persistent Qdrant collections indexed for ultra-fast HNSW cosine similarity search.",
      codeSnippet: "qdrant_client.upsert(collection='infosurf_chunks', points=batch)"
    },
    {
      id: "retrieval",
      label: "Search & Filter",
      icon: Search,
      tech: "Qdrant query_points + Cosine Distance",
      title: "Workspace-Isolated Retrieval",
      details: "User query is embedded and compared against the vector store. A strict workspace_id filter guarantees complete tenant isolation.",
      codeSnippet: "hits = qdrant_client.query_points(query=query_vector, filter=ws_filter)"
    },
    {
      id: "synthesis",
      label: "Grounded LLM",
      icon: Sparkles,
      tech: "Ollama Llama 3.1 · Gemini · Local Matcher",
      title: "Context-Aware Generation",
      details: "The LLM generates a comprehensive response grounded strictly in the retrieved context, injecting inline bracketed citations like [1].",
      codeSnippet: "answer = generate_answer(query, context_chunks, settings)"
    },
    {
      id: "citations",
      label: "Verified Answer",
      icon: ShieldCheck,
      tech: "Deterministic Provenance",
      title: "Interactive Source Grounding",
      details: "Every statement in the synthesized answer links back to the exact document, page, or repository file where the truth originated.",
      codeSnippet: "return {'answer': text, 'citations': [{index: 1, name: 'doc.pdf'}]}"
    }
  ];

  const active = pipelineNodes[selectedNode];

  return (
    <section id="pipeline" className="section-container">
      <div className="section-header">
        <div className="pill-badge">
          <Database size={13} />
          <span>Technical Architecture</span>
        </div>
        <h2 className="section-title">
          Built around retrieval, not guesswork.
        </h2>
        <p className="section-subtitle">
          An interactive, deterministic RAG architecture engineered for factual grounding, low latency, and verified source provenance.
        </p>
      </div>

      <div className="pipeline-canvas">
        {/* Pipeline Nodes Flow */}
        <div className="pipeline-nodes-flow">
          {pipelineNodes.map((node, idx) => {
            const IconComp = node.icon;
            const isSelected = selectedNode === idx;
            return (
              <React.Fragment key={node.id}>
                <div 
                  className={`pipeline-node ${isSelected ? "active-node" : ""}`}
                  onClick={() => setSelectedNode(idx)}
                >
                  <div style={{ width: 34, height: 34, borderRadius: "var(--radius-sm)", background: isSelected ? "rgba(0, 210, 255, 0.15)" : "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: isSelected ? "var(--accent-cyan)" : "var(--text-secondary)" }}>
                    <IconComp size={18} />
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: "600", color: isSelected ? "var(--accent-cyan)" : "var(--text-primary)" }}>
                    {node.label}
                  </span>
                  <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    Step 0{idx + 1}
                  </span>
                </div>
                {idx < pipelineNodes.length - 1 && (
                  <div className="pipeline-connector">
                    <ArrowRight size={14} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Node Deep Dive Details */}
        <div className="pipeline-details-panel">
          <div style={{ flex: 1, paddingRight: "20px" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
              <span className="status-dot-pulse" />
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                {active.tech}
              </span>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px", color: "#ffffff" }}>
              {active.title}
            </h3>
            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {active.details}
            </p>
          </div>

          <div style={{ width: "380px", maxWidth: "100%", background: "#060709", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent-cyan)", overflowX: "auto" }}>
            <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>// Implementation snippet</div>
            <code>{active.codeSnippet}</code>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RagPipelineVisual;
