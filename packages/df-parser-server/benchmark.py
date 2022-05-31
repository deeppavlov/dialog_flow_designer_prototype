import time
import libcst as cst
from df_server_server.parser import parse_module

N = 5

with open("big_plot.py") as f:
    big_plot_src = f.read()


def parse():
    try:
        wrapper = parse_module(cst.parse_module(big_plot_src))
    except:
        pass
    # wrapper.resolve(ScopeProvider)
    # wrapper.resolve(PositionProvider)


dts = []
for _ in range(N):
    start = time.time()
    parse()
    end = time.time()
    dts.append(end - start)

print(f"first run: {dts[0]:.3f}s")
print(f"subsequent runs {sum(dts[1:]) / (N - 1):.3f}s")
