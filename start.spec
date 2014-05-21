# -*- mode: python -*-
a = Analysis(['start.py'],
             pathex=['/media/sf_markus/programming/digital_humanities/python-django-test/tworpus'],
             hiddenimports=[django, lxml],
             hookspath=None,
             runtime_hooks=None)
pyz = PYZ(a.pure)
exe = EXE(pyz,
          a.scripts,
          exclude_binaries=False,
          name='start',
          debug=False,
          strip=None,
          upx=True,
          console=True )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=None,
               upx=True,
               name='start')
