import pathlib,json,hashlib,lzma,base64
root=pathlib.Path('.').resolve()
data=json.loads(lzma.decompress(base64.b64decode(pathlib.Path('.upgrade/final-copy.xz.b64').read_text())))
assert len(data)==16
out={}
for name,change in data.items():
 p=pathlib.Path(name)
 assert p.resolve().is_relative_to(root) and p.parts[0] in ['app','components','lib','scripts']
 original=p.read_bytes()
 assert hashlib.sha256(original).hexdigest()==change['sha'],name
 text=original.decode()
 for a,b,replacement in reversed(change['edits']):text=text[:a]+replacement+text[b:]
 out[name]=text
for name,text in out.items():pathlib.Path(name).write_bytes(text.encode())
print('Verified final translated copy and browser failure diagnostics.')
