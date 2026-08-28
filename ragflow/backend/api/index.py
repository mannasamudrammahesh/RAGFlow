import os
import tempfile
import sys

# Ensure Vercel serverless has a valid temporary directory
os.environ['TMPDIR'] = '/tmp'
tempfile.tempdir = '/tmp'
try:
    os.makedirs('/tmp', exist_ok=True)
    os.makedirs('/tmp/fastembed_cache', exist_ok=True)
except Exception:
    pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app