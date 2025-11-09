#[unsafe(no_mangle)]
pub extern "C" fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[unsafe(no_mangle)]
pub extern "C" fn malloc(size: u32) -> u32 {
    // let arr: &[u32] = &[0; size];
    return 1;
}
