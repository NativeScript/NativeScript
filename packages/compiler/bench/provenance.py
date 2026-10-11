"""What a measurement was taken with, stored beside it: the compiler's commit (and whether its tree had changes),
its package version, the host's Xcode, and the time. Results without it cannot be compared across compiler changes."""
import json, os, subprocess, time

COMPILER = os.environ.get('NS_COMPILER') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def _out(cmd, cwd=None):
    try: return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=30).stdout.strip() or None
    except (OSError, subprocess.TimeoutExpired): return None


def provenance():
    return {
        'compiler_commit': _out(['git', 'rev-parse', 'HEAD'], COMPILER),
        'compiler_dirty': bool(_out(['git', 'status', '--porcelain', '--', '.'], COMPILER)),
        'compiler_version': json.load(open(os.path.join(COMPILER, 'package.json'))).get('version'),
        'xcode': (_out(['xcodebuild', '-version']) or '').split('\n')[0] or None,
        'measured_at': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
    }
