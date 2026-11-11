"""그림 있는 묶음마다 스크린샷에서 그림 잘라 xhs/crop/g###.png + 묶음 파일별 대조표"""
import sys, json
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(sys.argv[1])
G = json.loads((ROOT / 'groups.json').read_text())
out = ROOT / 'crop'; out.mkdir(exist_ok=True)
for g in G:
    if not g['img_box']:
        continue
    im = Image.open(ROOT / 'img' / f"p-{g['img_page'] - 1:03d}.jpg").convert('RGB')
    x0, y0, x1, y1 = g['img_box']
    im.crop((x0, y0, x1, y1)).save(out / f"g{g['gid']}.png")
def sheet(gids, name):
    W, H = 300, 170
    cols = 4
    rows = (len(gids) + cols - 1) // cols
    sh = Image.new('RGB', (cols * W, rows * (H + 16)), 'white')
    d = ImageDraw.Draw(sh)
    for i, gid in enumerate(gids):
        im = Image.open(out / f'g{gid}.png'); im.thumbnail((W - 6, H - 4))
        x, y = (i % cols) * W, (i // cols) * (H + 16)
        sh.paste(im, (x + 3, y + 2)); d.text((x + 4, y + H), f'#{gid}', fill='red')
    sh.save(ROOT / 'review' / name)
if len(sys.argv) > 2:
    gids = [int(x) for x in sys.argv[2].split(',')]
    sheet(gids, sys.argv[3])
