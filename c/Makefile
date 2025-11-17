STACK_SIZE := $(shell expr 1 \* 1024 \* 1024 \* 8)
HEAP_SIZE := $(shell expr 64 \* 1024 \* 1024 \* 8)
MEM_SIZE := $(shell expr $(STACK_SIZE) + $(HEAP_SIZE))
OPTIONS := --target=wasm32 -O3 -flto -nostdlib -Wl,--no-entry -Wl,--export-all -Wl,--lto-O3 -Wl,-z,stack-size=$(STACK_SIZE) -Wl,--initial-memory=$(MEM_SIZE)
build: main.c
	clang $(OPTIONS) -o main.wasm main.c
wat: main.wasm
	wasm2wat main.wasm -o main.wat
copy: main.wasm
	cp main.wasm ../web/src/p-calc.wasm