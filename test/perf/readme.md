# Run D-trace
osx: sudo dtrace -n 'profile-997/execname == "node" && arg1/ {
         @[ustack(1)] = count();
      } tick-10s { exit(0); }' > out.stacks

# Run Stack Vis
stackvis dtrace flamegraph-svg < stacks.out > stacks.svg

