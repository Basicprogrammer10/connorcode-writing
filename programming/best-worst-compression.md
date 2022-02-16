@Title = Best Worst Compression
@Author = Connor Slade
@Date = 02-15-21
@Description = Making the best (worst) compression system
@Tags = Compression, Hash, sha256, Rust, Programming
@Path = programming/best-worst-compression
@Assets = .

---

# 📁 Best Worst Compression

So,,, I think I may have just made the ~best~ _worst_ compression system ever.
It compress any file size to around `36 bytes`, the catch is the decompression time.
For my 4 byte test file `Hi\r\n` it took like thirty minutes to decompress.

## 🦄 How it works

So lets see how this very *ingenious* system works!

### Compression

For compression a file we take the hash of the file and the number of bytes in it.
This data is then write to a new file. Yeah, that's all.
I think you can see where this is going...

Here is the code I made for compression:

```rust
fn compress<T>(file: T)
where
    T: AsRef<Path>,
{
    let inp = fs::read(&file).unwrap();
    let size = inp.len();

    let mut hasher = Sha256::new();
    hasher.update(inp);
    let hash = hasher.finalize().to_vec();

    let mut out = hash;
    out.extend((size as u32).to_be_bytes());

    let mut path = file.as_ref().to_string_lossy().to_string();
    path.push_str(".cc");

    fs::write(path, out).unwrap();
}
```

### Decompression

Here is where things get a little complacated.  
We need to try every possable permutation of bytes in the defined size, then check the hash.

And here is the code for decompression:

```rust
fn decompress<T>(file: T)
where
    T: AsRef<Path>,
{
    let inp = fs::read(&file).unwrap();

    let parts = inp.split_at(32);
    let mut rdr = Cursor::new(parts.1);
    let size = rdr.read_u32::<BigEndian>().unwrap();

    let hash = parts
        .0
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect::<Vec<String>>()
        .join("");

    println!("Length: {}", size);
    println!("Hash: {}", hash);
    let hash = hash.bytes().collect_vec();

    for i in (0..=255).permutations(size as usize) {
        let mut hasher = Sha256::new();
        hasher.update(&i);
        let this_hash = hasher.finalize().to_vec();

        if this_hash == hash {
            println!("Found!");
            fs::write("OUT.txt", i).unwrap();
            break;
        }
    }
}
```
