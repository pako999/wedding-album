import hashlib, json, lzma, os, pathlib
root = pathlib.Path('.').resolve()
raw = b''.join(pathlib.Path(f'.upgrade/chunk-{i}.xzpart').read_bytes() for i in range(5))
assert hashlib.sha256(raw).hexdigest() == '159af2d699cbb9357df4b4b2a96f5198a4b72e16a9d4c0afea0d7d1c8c07d013', 'Transfer hash mismatch'
data = json.loads(lzma.decompress(raw))
assert len(data) == 98
outputs = {}
for name, change in data.items():
 p = pathlib.Path(name)
 assert not p.is_absolute() and '..' not in p.parts
 assert p.parts[0] in ['app','components','content','docs','lib','scripts','package.json','proxy.ts']
 assert p.resolve().is_relative_to(root)
 if 'new' in change:
  assert not p.exists(), f'New path already exists: {name}'
  text = change['new']
 else:
  original = p.read_bytes() if p.exists() else b''
  assert hashlib.sha256(original).hexdigest() == change['sha'], f'Source changed: {name}'
  text = original.decode('utf8')
  for start, end, replacement in reversed(change['edits']):
   text = text[:start] + replacement + text[end:]
 outputs[name] = text
for name, text in outputs.items():
 p = pathlib.Path(name); p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(text.encode('utf8'))
pathlib.Path(os.environ['RUNNER_TEMP'], 'wedding-paths.txt').write_text('\n'.join(data) + '\n')
print(f'Applied and verified {len(outputs)} GuestCam source files; no production access.')
