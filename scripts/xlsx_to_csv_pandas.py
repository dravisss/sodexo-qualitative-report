import argparse
import os
import re
import zipfile
from pathlib import Path

import pandas as pd


def slugify(name: str) -> str:
    name = name.strip()
    name = re.sub(r"\s+", " ", name)
    name = re.sub(r"[\\/:*?\"<>|]", "-", name)
    name = name.replace(" ", "_")
    name = re.sub(r"_+", "_", name)
    return name[:120] if len(name) > 120 else name


def try_repair_xlsx(input_path: Path, outdir: Path) -> Path | None:
    """Best-effort repair for XLSX files that have extra bytes before the ZIP header.

    Some files can be transferred/stored with a prefix (e.g., extra bytes at beginning),
    which breaks zip central directory detection.

    Strategy:
    - Find first occurrence of PK\x03\x04 (ZIP local file header)
    - Slice from there and write a repaired copy
    """
    raw = input_path.read_bytes()
    sig = b"PK\x03\x04"
    idx = raw.find(sig)
    if idx <= 0:
        return None

    repaired = outdir / f"_repaired__{input_path.name}"
    repaired.write_bytes(raw[idx:])

    # Validate the repaired file is a zip (best-effort)
    try:
        with zipfile.ZipFile(repaired, "r") as zf:
            zf.testzip()
    except Exception:
        return None

    return repaired


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to .xlsx")
    parser.add_argument(
        "--outdir",
        required=True,
        help="Output directory (will be created). One CSV per sheet.",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    # Read all sheets (with best-effort repair)
    try:
        sheets = pd.read_excel(input_path, sheet_name=None)
    except Exception as err:
        repaired = try_repair_xlsx(input_path, outdir)
        if not repaired:
            raise RuntimeError(
                f"Failed to read XLSX: {input_path} (no repair possible). Original error: {err}"
            ) from err
        try:
            sheets = pd.read_excel(repaired, sheet_name=None)
        except Exception as err2:
            raise RuntimeError(
                f"Failed to read XLSX even after repair: {input_path} -> {repaired}. Error: {err2}"
            ) from err2

    for sheet_name, df in sheets.items():
        safe = slugify(sheet_name) or "sheet"
        out_path = outdir / f"{safe}.csv"
        df.to_csv(out_path, index=False)

    print(f"Sheets: {len(sheets)}")
    print(f"Output: {outdir}")


if __name__ == "__main__":
    main()
