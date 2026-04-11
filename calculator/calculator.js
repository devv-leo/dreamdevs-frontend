const INIT = { current: "0", prev: null, op: null, fresh: false };

const add = (a, b) => a + b;
const sub = (a, b) => a - b;
const mul = (a, b) => a * b;
const div = (a, b) => b !== 0 ? a / b : "Error";
const OPS = { "+": add, "−": sub, "×": mul, "÷": div };

const parse = s => parseFloat(s);

const fmt = n => {
  if (n === "Error") return "Error";
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (!isFinite(v)) return "Error";
  const s = parseFloat(v.toPrecision(10)).toString();
  return s.length > 13 ? parseFloat(v.toPrecision(9)).toString() : s;
};

const compute = s =>
  s.op && s.prev !== null
    ? { ...s, current: fmt(OPS[s.op](parse(s.prev), parse(s.current))) }
    : s;

const handleDigit = (s, d) => {
  if (s.fresh) return { ...s, current: d === "0" ? "0" : d, fresh: false };
  if (s.current === "0" && d !== "0") return { ...s, current: d };
  if (s.current.length >= 12) return s;
  return { ...s, current: s.current + d };
};

const handleOp = (s, op) => {
  if (s.op && !s.fresh) {
    const evaled = compute(s);
    return { current: evaled.current, prev: evaled.current, op, fresh: true };
  }
  return { current: s.current, prev: s.current, op, fresh: true };
};

const handleEquals = s => {
  if (!s.op) return s;
  const evaled = compute(s);
  return { current: evaled.current, prev: null, op: null, fresh: false };
};

const handleClear   = ()  => ({ ...INIT });
const handleSign    = s   => ({
  ...s,
  current: s.current.startsWith("-")
    ? s.current.slice(1)
    : s.current === "0" ? "0" : "-" + s.current
});
const handlePercent = s   => ({ ...s, current: fmt(parse(s.current) / 100) });
const handleDot     = s   =>
  s.current.includes(".")
    ? s
    : s.fresh
      ? { ...s, current: "0.", fresh: false }
      : { ...s, current: s.current + "." };

const exprStr = s => s.prev !== null && s.op ? `${s.prev} ${s.op}` : "";

let state = { ...INIT };
const valEl  = document.getElementById("val");
const exprEl = document.getElementById("expr");

const render = s => {
  valEl.textContent  = s.current;
  exprEl.textContent = exprStr(s);
};

const dispatch = (action, data) => {
  switch (action) {
    case "digit":   state = handleDigit(state, data.d);  break;
    case "op":      state = handleOp(state, data.op);    break;
    case "equals":  state = handleEquals(state);         break;
    case "clear":   state = handleClear();               break;
    case "sign":    state = handleSign(state);           break;
    case "percent": state = handlePercent(state);        break;
    case "dot":     state = handleDot(state);            break;
  }
  render(state);
};

document.getElementById("btns").addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  dispatch(btn.dataset.action, btn.dataset);
});

render(state);
