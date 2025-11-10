typedef __INT32_TYPE__ i32;
typedef __INT16_TYPE__ i16;
typedef __INT8_TYPE__ i8;
typedef __UINT32_TYPE__ u32;
typedef __UINT16_TYPE__ u16;
typedef __UINT8_TYPE__ u8;

#define E_MEMORY_LIMIT 1   // メモリ不足
#define OUT_OF_RANGE 2     // 範囲外アクセス
#define E_RESET_REQUIRED 3 // 未リセットでの再書き込み
#define E_BONUS_NOT_SET 4  // ボーナス%配列未設定

extern void __heap_base;
// 発生原因を特定するためのコードを引数に取る
extern void fatal(i32) __attribute__((import_module("env"), import_name("fatal")));

void* bumpPointer = 0;

void* bonusPointer = 0;
i32 bonusLength = 0;
// ボーナス%をJSからセットする
void* setBonusArray() {
	if (bumpPointer != 0 || bonusPointer != 0 || bonusLength != 0) {
		fatal(E_RESET_REQUIRED);
		return 0;
	}
	bumpPointer = &__heap_base;
	if ((i32)bumpPointer % 4 != 0) {
		bumpPointer += 4 - ((i32)bumpPointer % 4);
	}
	bonusPointer = bumpPointer;
	return bonusPointer;
}
void setBonusFin(i32 size) {
	bonusLength = size;
	// i32を利用するので配列長*4
	bumpPointer += size * 4;
}

inline i32 bonus(i32 i) {
	return *(i32*)(bonusPointer + i * 4);
}

void* dpPointer = 0;
void* parentPointer = 0;
i32 dpSize = 0;
void* resultPointer = 0;
i32 resultSize = 0;

inline i32* dp(i32 i) {
	return (i32*)(dpPointer + i * 4);
}
inline i32* parent(i32 i) {
	return (i32*)(parentPointer + i * 4);
}
inline i32* result(i32 i) {
	return (i32*)(resultPointer + i * 4);
}

void calc(i32 x) {
	if (bonusLength == 0) {
		fatal(E_BONUS_NOT_SET);
		return;
	}
	if (dpPointer != 0 || parentPointer != 0) {
		fatal(E_RESET_REQUIRED);
		return;
	}
	dpSize = x + 1;
	dpPointer = bumpPointer;
	bumpPointer += dpSize * 4;
	parentPointer = bumpPointer;
	bumpPointer += dpSize * 4;
	resultPointer = bumpPointer;
	i32 INF = x + 1;
	for (i32 i = 0; i < dpSize; i++) {
		*dp(i) = INF;
		*parent(i) = -1;
	}
	*dp(0) = 0;
	for (i32 i = 0; i < bonusLength; i++) {
		i32 b = bonus(i);
		if (b <= 0) continue;
		for (i32 j = b; j <= x; j++) {
			if (*dp(j - b) < INF) {
				i32 a = *dp(j - b) + 1;
				if (a < *dp(j)) {
					*dp(j) = a;
					*parent(j) = b;
				}
			}
		}
	}
}

i32 getResult(i32 x) {
	return *dp(dpSize - x - 1);
}
i32 buildResult(i32 x) {
	int r = dpSize - x - 1;
	resultSize = 0;
	while (r > 0) {
		i32 p = *parent(r);
		if (p < 0) return -1;
		*result(resultSize) = p;
		resultSize++;
		r -= p;
	}
	return 0;
}
i32 getResultPointer() {
	return (i32)resultPointer;
}
i32 getResultSize() {
	return resultSize;
}

void resetDp() {
	dpPointer = 0;
	parentPointer = 0;
	dpSize = 0;
	resultPointer = 0;
	resultSize = 0;
}
void resetAll() {
	bumpPointer = 0;
	bonusPointer = 0;
	bonusLength = 0;
	resetDp();
}