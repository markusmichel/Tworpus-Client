import django
import enum

# -*- mode: python -*-
a = Analysis(['tworpus_linux.py'],
             pathex=['/media/sf_markus/programming/digital_humanities/python-django-test/tworpus'],
             hiddenimports=[django],
             hookspath=None,
             runtime_hooks=None)
pyz = PYZ(a.pure)
exe = EXE(pyz,
          a.scripts,
          exclude_binaries=True,
          name='tworpus_linux',
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
               name='tworpus_linux')
