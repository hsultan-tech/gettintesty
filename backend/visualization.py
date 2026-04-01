
import json
import re
import base64
import io

# Use a non-GUI backend (safe for servers/containers/uvicorn)
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


def detect_chart_type(message: str) -> str:
    """
    Detect chart type based on user message.
    Defaults to 'bar' if not specified.
    """
    message = message.lower()
    if "line" in message:
        return "line"
    elif "pie" in message:
        return "pie"
    elif "scatter" in message:
        return "scatter"
    elif "histogram" in message:
        return "histogram"
    else:
        return "bar"  # Default chart type


# ---------- Helpers to clean/prepare data ----------

def _normalize_numbers(data: dict) -> dict:
    """
    Convert values like '7.6%' or '10' strings to floats.
    Raises ValueError if conversion fails.
    """
    normalized = {}
    for k, v in data.items():
        if isinstance(v, str):
            s = v.strip()
            # Strip percent sign if present
            if s.endswith("%"):
                s = s[:-1]
            # Remove commas in thousands (e.g., "1,234.56")
            s = s.replace(",", "")
            normalized[k] = float(s)
        else:
            normalized[k] = float(v)
    return normalized


def _sorted_labels(labels):
    """
    Try to sort labels numerically if they look like years (e.g., '2015').
    Otherwise, return as-is (preserve insertion order).
    """
    try:
        return sorted(labels, key=lambda x: int(str(x)))
    except Exception:
        return list(labels)


# ---------- Robust JSON parsing ----------

def parse_llm_output(parsed_data: str) -> dict:
    """
    Safely parse LLM output into a Python dict.

    Handles common patterns:
      - Markdown code fences: ```json ... ``` or ``` ... ```
      - Leading/trailing text around the JSON
    Extracts the first {...} block and loads it.
    """
    # If the model already returned a dict, just forward it
    if isinstance(parsed_data, dict):
        return parsed_data

    cleaned = str(parsed_data).strip()

    # Strip starting/ending Markdown code fences if present
    if cleaned.startswith("```"):
        # Remove opening fence with optional language tag
        cleaned = re.sub(r"^```[a-zA-Z]*\s*", "", cleaned)
        # Remove trailing fence
        cleaned = re.sub(r"\s*```$", "", cleaned)

    # Extract the first JSON object block
    m = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if not m:
        raise ValueError("LLM output is not valid JSON: no JSON object found")

    obj_str = m.group(0)

    try:
        return json.loads(obj_str)
    except json.JSONDecodeError as e:
        # Optionally, you could attempt light fixes here (e.g., stray commas)
        raise ValueError(f"LLM output is not valid JSON: {e}")


# ---------- Chart generator (PNG Base64) ----------

def generate_chart(data: dict, chart_type: str, title: str = None) -> str:
    """
    Generate a chart based on the given data and chart type.
    Returns the chart as a Base64-encoded PNG string.
    """
    # Normalize numeric values (handles '7.6%' and numeric strings)
    data = _normalize_numbers(data)

    labels = list(data.keys())
    labels = _sorted_labels(labels)  # Sort years numerically if applicable
    values = [data[l] for l in labels]

    # Figure/axes
    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=150)

    chart_type = (chart_type or "bar").lower()

    # Choose chart type
    if chart_type == "bar":
        ax.bar(labels, values, color="#1f77b4", alpha=0.85)
        ax.set_xlabel("Year" if _looks_like_years(labels) else "Categories")
        ax.set_ylabel("Value" if not _looks_like_years(labels) else "Return (%)")
        ax.grid(True, axis="y", linestyle="--", alpha=0.4)

    elif chart_type == "line":
        ax.plot(labels, values, marker="o", linewidth=2, color="#2ca02c")
        ax.set_xlabel("Year" if _looks_like_years(labels) else "X")
        ax.set_ylabel("Value" if not _looks_like_years(labels) else "Return (%)")
        ax.grid(True, linestyle="--", alpha=0.4)

    elif chart_type == "pie":
        # Pie charts can't display negative values meaningfully; use absolute magnitudes
        ax.pie([abs(v) for v in values], labels=labels, autopct="%1.1f%%", startangle=90)
        ax.axis("equal")  # equal aspect ratio ensures that pie is drawn as a circle

    elif chart_type == "scatter":
        # For scatter, labels should be numeric x-values; try a conversion
        x = _labels_to_numeric(labels)
        ax.scatter(x, values, color="#9467bd")
        ax.set_xlabel("X")
        ax.set_ylabel("Value")
        ax.grid(True, linestyle="--", alpha=0.4)

    elif chart_type == "histogram":
        ax.hist(values, bins=_safe_bins(len(values)), color="#ff7f0e", edgecolor="black")
        ax.set_xlabel("Value Range")
        ax.set_ylabel("Frequency")
        ax.grid(True, axis="y", linestyle="--", alpha=0.4)

    else:
        # Fallback: use line chart
        ax.plot(labels, values, marker="o", linewidth=2, color="#2ca02c")
        ax.set_xlabel("Year" if _looks_like_years(labels) else "X")
        ax.set_ylabel("Value" if not _looks_like_years(labels) else "Return (%)")
        ax.grid(True, linestyle="--", alpha=0.4)

    # Title
    if title:
        ax.set_title(title)
    else:
        # Default titles per chart type
        default_title = {
            "bar": "Bar Chart",
            "line": "Line Chart",
            "pie": "Pie Chart",
            "scatter": "Scatter Plot",
            "histogram": "Histogram",
        }.get(chart_type, "Chart")
        ax.set_title(default_title)

    # Tight layout to avoid clipping
    fig.tight_layout()

    # Save to PNG bytes
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)  # Close figure to free memory
    buf.seek(0)

    # Encode to base64
    return base64.b64encode(buf.read()).decode("utf-8")


# ---------- Small utilities ----------

def _safe_bins(n: int) -> int:
    # Avoid zero bins; cap bins to a reasonable number
    return max(5, min(50, n))


def _looks_like_years(labels) -> bool:
    """
    Heuristic: if all labels look like 4-digit years.
    """
    try:
        return all(re.fullmatch(r"\d{4}", str(l)) for l in labels)
    except Exception:
        return False


def _labels_to_numeric(labels):
    """
    Convert labels to numeric values (for scatter).
    If conversion fails, fall back to index positions.
    """
    xs = []
    for i, l in enumerate(labels):
        try:
            xs.append(float(l))
        except Exception:
            xs.append(float(i))
    return xs
