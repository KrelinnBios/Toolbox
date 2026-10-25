export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export function field({ id, name, label, value, step = "any", max, type = "number" }) {
  return `<label class="tool-field" for="${escapeHtml(id)}">
    <span>${escapeHtml(label)}</span>
    <input id="${escapeHtml(id)}" name="${escapeHtml(name)}" type="${type}" value="${escapeHtml(value)}"
      ${type === "number" ? `inputmode="decimal" min="0" step="${step}"${max === undefined ? "" : ` max="${max}"`}` : ""}>
  </label>`;
}

export function resultRow({ id, label, value, strong = false }) {
  return `<div${id ? ` id="${escapeHtml(id)}"` : ""} class="tool-result${strong ? " strong" : ""}">
    <dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>
  </div>`;
}
