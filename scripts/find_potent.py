import csv

search_list = ['Fentanyl', 'Buprenorphine', 'Clonazepam', 'Alprazolam', 'Atropine', 'Scopolamine', 'Midazolam', 'Lorazepam']

with open('scripts/rate.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    results = []
    for row in reader:
        name = row['Generic Name'].lower()
        if any(s.lower() in name for s in search_list):
            results.append(row)

# Filter for the smallest strengths (most potent per unit)
print(f"{'Potent Drug Found':<60} | {'Unit Size':<15} | {'MRP'}")
print("-" * 90)
for r in results:
    print(f"{r['Generic Name']:<60} | {r['Unit Size']:<15} | {r['MRP']}")
