# Post-process index.html so screenshots are embedded and links point at standalone/ pages
import re,base64,io,os
from PIL import Image
os.chdir(os.path.join(os.path.dirname(__file__),'..'))
h=open('index.html').read(); css=re.sub(r'url\("assets/[^"]+"\)','none',open('theme.css').read())
def img(m):
    p=m.group(1); im=Image.open(p).convert('RGB'); w=900 if 'desktop' in p else 390
    if im.width>w: im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)
    b=io.BytesIO(); im.save(b,'JPEG',quality=72); return 'src="data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()+'"'
h=re.sub(r'src="(screenshots/[^"]+\.png)"',img,h); h=re.sub(r'<a href="screenshots/[^"]+">(<img[^>]*>)</a>',r'\1',h)
h=h.replace('href="pages/','href="standalone/').replace('<link rel="stylesheet" href="theme.css"><script src="theme.js"></script>','')
h=h.replace('<style>','<style>'+css+'\n',1)
h=h.replace('</div></body>','<p class="board-note">Screenshots are embedded so this page works on its own. The linked pages in <code>standalone/</code> are self-contained; editable sources are in <code>pages/</code>.</p></div></body>')
open('index.html','w').write(h)
