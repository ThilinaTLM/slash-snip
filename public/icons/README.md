# Icon Placeholders

The SVG files in this directory are placeholder icons. Before loading the extension in Chrome, convert them to PNG format:

```bash
# Using ImageMagick
convert icon-16.svg icon-16.png
convert icon-32.svg icon-32.png
convert icon-48.svg icon-48.png
convert icon-128.svg icon-128.png

# Or using Inkscape
inkscape icon-16.svg -o icon-16.png
inkscape icon-32.svg -o icon-32.png
inkscape icon-48.svg -o icon-48.png
inkscape icon-128.svg -o icon-128.png
```

Chrome extensions require PNG icons. The manifest.json references these PNG files.
