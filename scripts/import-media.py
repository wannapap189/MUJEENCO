import concurrent.futures, hashlib, json, os, pathlib, time, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'scripts/media-import.json').read_text(encoding='utf-8'))
ORIGIN = MANIFEST['origin']
assert ORIGIN == 'https://mujeen-art-preview.enjoyableheath1.chatgpt.site'

def download(item):
    relative = pathlib.PurePosixPath(item['path'])
    if relative.is_absolute() or '..' in relative.parts or relative.parts[0] not in ('assets', 'videos'):
        raise ValueError('Unexpected media path')
    destination = ROOT.joinpath(*relative.parts)
    destination.parent.mkdir(parents=True, exist_ok=True)
    url = ORIGIN + '/' + urllib.parse.quote(item['path'], safe='/')
    temporary = destination.with_name(destination.name + '.import-part')
    for attempt in range(3):
        try:
            digest = hashlib.sha256()
            length = 0
            request = urllib.request.Request(url, headers={'User-Agent': 'MUJEENCO-frontend-import/1.0'})
            with urllib.request.urlopen(request, timeout=90) as response, temporary.open('wb') as target:
                while True:
                    block = response.read(1024 * 1024)
                    if not block:
                        break
                    length += len(block)
                    if length > item['size']:
                        raise ValueError('Media size exceeds the approved original: ' + item['path'])
                    digest.update(block)
                    target.write(block)
            if length != item['size'] or digest.hexdigest() != item['sha256']:
                raise ValueError('Media verification failed: ' + item['path'])
            os.replace(temporary, destination)
            return item['path']
        except Exception:
            temporary.unlink(missing_ok=True)
            if attempt == 2:
                raise
            time.sleep(attempt + 1)

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    futures = [pool.submit(download, item) for item in MANIFEST['files']]
    for count, future in enumerate(concurrent.futures.as_completed(futures), 1):
        future.result()
        if count % 25 == 0 or count == len(futures):
            print(f'Verified {count}/{len(futures)} media files', flush=True)
