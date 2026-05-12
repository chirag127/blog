import csv
import os
import json

csv_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "rate.csv"
)

drugs = {
    "codeine": [],
    "tramadol": [],
    "tapentadol": [],
    "morphine": [],
    "fentanyl": [],
    "buprenorphine": [],
    "methadone": [],
    "alprazolam": [],
    "diazepam": [],
    "clonazepam": [],
    "lorazepam": [],
    "nitrazepam": [],
    "midazolam": [],
    "chlordiazepoxide": [],
    "clobazam": [],
    "pregabalin": [],
    "gabapentin": [],
}

with open(csv_path, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row["Generic Name"].lower()
        for drug_key in drugs:
            if drug_key in name:
                mrp = row["MRP"]
                note = ""
                if mrp == "0":
                    note = " (Zero MRP - Under Process)"
                drugs[drug_key].append({
                    "name": row["Generic Name"],
                    "unit": row["Unit Size"],
                    "mrp": mrp,
                    "group": row["Group Name"],
                    "note": note,
                })

for drug, entries in drugs.items():
    print(f"\n{'='*60}")
    print(f"  {drug.upper()}")
    print(f"{'='*60}")
    if not entries:
        print("  NOT AVAILABLE in Jan Aushadhi Kendra")
    else:
        for i, e in enumerate(entries, 1):
            print(
                f"  {i}. {e['name']}\n"
                f"     Unit: {e['unit']} | "
                f"MRP: Rs.{e['mrp']}{e['note']}\n"
                f"     Group: {e['group']}"
            )
