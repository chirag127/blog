import os
import re

directory = r'c:\Users\chira\OneDrive\GitHub\blog.oriz.in\src\content\blog\substance-use-education-india'

# Pattern for relative links I just created or absolute links
pattern_links = re.compile(r'\((\./|file:///.*?/)part-(\d+)-([\w-]+)\)')
# Also catch links that might have .mdx at the end
pattern_links_mdx = re.compile(r'\((\./|file:///.*?/)part-(\d+)-([\w-]+)\.mdx\)')

def fix_all():
    for filename in os.listdir(directory):
        if filename.endswith('.mdx'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace with root-relative paths
            # Note: Astro usually maps /src/content/blog/X.mdx to /blog/X/
            # But the parent folder is /substance-use-education-india/
            # So the correct root-relative path is /blog/substance-use-education-india/part-X-name
            
            new_content = pattern_links.sub(r'(/blog/substance-use-education-india/part-\2-\3)', content)
            new_content = pattern_links_mdx.sub(r'(/blog/substance-use-education-india/part-\2-\3)', new_content)
            
            # Special check for index.mdx if it has relative links
            if filename == "index.mdx":
                new_content = new_content.replace('(./part-', '(/blog/substance-use-education-india/part-')

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated to root-relative: {filename}")

if __name__ == "__main__":
    fix_all()
