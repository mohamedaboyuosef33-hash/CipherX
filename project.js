

function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  document.getElementById('tab-' + name).classList.add('active');
  event.target.classList.add('active');
}

function setStatus(id, msg, isOk) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'status ' + (isOk ? 'ok' : 'err');
}

function copyText(spanId) {
  const text = document.getElementById(spanId).textContent;
  navigator.clipboard.writeText(text).catch(() => {});
}

function symEncrypt() {
  const algo  = document.getElementById('sym-algo').value;   
  const input = document.getElementById('sym-input').value.trim();
  const key   = document.getElementById('sym-key').value.trim();

  if (!input || !key) {
    setStatus('sym-status', '⚠ Please fill in both plaintext and key.', false);
    return;
  }

  try {
    const encrypted = CryptoJS[algo].encrypt(input, key).toString();
    document.getElementById('sym-output-text').textContent = encrypted;
    setStatus('sym-status', `✓ Encrypted with ${algo} successfully.`, true);
  } catch(e) {
    setStatus('sym-status', '✗ Encryption failed: ' + e.message, false);
  }
}

function symDecrypt() {
  const algo  = document.getElementById('sym-algo').value;
  const input = document.getElementById('sym-input').value.trim();
  const key   = document.getElementById('sym-key').value.trim();

  if (!input || !key) {
    setStatus('sym-status', '⚠ Please fill in both ciphertext and key.', false);
    return;
  }

  try {
    const decrypted = CryptoJS[algo].decrypt(input, key).toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      setStatus('sym-status', '✗ Decryption failed: wrong key or corrupted ciphertext.', false);
      return;
    }

    document.getElementById('sym-output-text').textContent = decrypted;
    setStatus('sym-status', `✓ Decrypted with ${algo} successfully.`, true);
  } catch(e) {
    setStatus('sym-status', '✗ Decryption error: ' + e.message, false);
  }
}


let rsaPublicKey  = '';   
let rsaPrivateKey = '';

function generateRSAKeys() {
  setStatus('rsa-gen-status', '⏳ Generating 2048-bit key pair... (this may take a moment)', true);

  setTimeout(() => {
    try {
      const crypt = new JSEncrypt({ default_key_size: 2048 });
      crypt.getKey(); 

      rsaPublicKey  = crypt.getPublicKey();
      rsaPrivateKey = crypt.getPrivateKey();

      document.getElementById('rsa-pub').textContent  = rsaPublicKey;
      document.getElementById('rsa-priv').textContent = rsaPrivateKey;
      document.getElementById('rsa-enc-pub').value  = rsaPublicKey;
      document.getElementById('rsa-dec-priv').value = rsaPrivateKey;

      setStatus('rsa-gen-status', '✓ 2048-bit RSA key pair generated.', true);
    } catch(e) {
      setStatus('rsa-gen-status', '✗ Key generation failed: ' + e.message, false);
    }
  }, 50);
}

function rsaEncrypt() {
  const msg    = document.getElementById('rsa-enc-input').value.trim();
  const pubKey = document.getElementById('rsa-enc-pub').value.trim();

  if (!msg || !pubKey) {
    setStatus('rsa-enc-status', '⚠ Provide both message and public key.', false);
    return;
  }

  try {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(pubKey);
    const result = encrypt.encrypt(msg); 

    if (!result) {
      setStatus('rsa-enc-status', '✗ Encryption failed. Check your public key.', false);
      return;
    }

    document.getElementById('rsa-enc-out').textContent = result;
    setStatus('rsa-enc-status', '✓ Encrypted with RSA public key.', true);
  } catch(e) {
    setStatus('rsa-enc-status', '✗ Error: ' + e.message, false);
  }
}

function rsaDecrypt() {
  const cipher  = document.getElementById('rsa-dec-input').value.trim();
  const privKey = document.getElementById('rsa-dec-priv').value.trim();

  if (!cipher || !privKey) {
    setStatus('rsa-dec-status', '⚠ Provide both ciphertext and private key.', false);
    return;
  }

  try {
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privKey);
    const result = decrypt.decrypt(cipher);  

    if (!result) {
      setStatus('rsa-dec-status', '✗ Decryption failed. Check your private key.', false);
      return;
    }

    document.getElementById('rsa-dec-out').textContent = result;
    setStatus('rsa-dec-status', '✓ Decrypted with RSA private key.', true);
  } catch(e) {
    setStatus('rsa-dec-status', '✗ Error: ' + e.message, false);
  }
}

function encEncode() {
  const scheme = document.getElementById('enc-algo').value;
  const text   = document.getElementById('enc-input').value;

  if (!text) { setStatus('enc-status','⚠ Enter some text first.', false); return; }

  try {
    let result;
    if (scheme === 'base64') {
      result = btoa(unescape(encodeURIComponent(text)));
    } else if (scheme === 'hex') {
      result = Array.from(text)
                 .map(c => c.charCodeAt(0).toString(16).padStart(2,'0'))
                 .join('');
    } else {  
      result = encodeURIComponent(text);
    }
    document.getElementById('enc-out').textContent = result;
    setStatus('enc-status', `✓ Encoded as ${scheme.toUpperCase()}.`, true);
  } catch(e) {
    setStatus('enc-status', '✗ Encode error: ' + e.message, false);
  }
}

function encDecode() {
  const scheme = document.getElementById('enc-algo').value;
  const text   = document.getElementById('enc-input').value.trim();

  if (!text) { setStatus('enc-status','⚠ Enter encoded text first.', false); return; }

  try {
    let result;
    if (scheme === 'base64') {
      result = decodeURIComponent(escape(atob(text)));
    } else if (scheme === 'hex') {
      if (text.length % 2 !== 0) throw new Error('Invalid hex string length.');
      result = text.match(/.{2}/g)
                   .map(h => String.fromCharCode(parseInt(h, 16)))
                   .join('');
    } else {  
      result = decodeURIComponent(text);
    }
    document.getElementById('enc-out').textContent = result;
    setStatus('enc-status', `✓ Decoded from ${scheme.toUpperCase()}.`, true);
  } catch(e) {
    setStatus('enc-status', '✗ Decode error: ' + e.message, false);
  }
}



document.getElementById('hash-algo').addEventListener('change', function() {
  document.getElementById('salt-row').style.display =
    this.value === 'salted' ? 'block' : 'none';
  if (this.value === 'salted') genSalt();
});

function genSalt() {
  const arr = new Uint8Array(16);
  window.crypto.getRandomValues(arr);  
  document.getElementById('hash-salt').value =
    Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
}

function computeHash() {
  const algo  = document.getElementById('hash-algo').value;
  const input = document.getElementById('hash-input').value;

  if (!input) { setStatus('hash-status','⚠ Enter text to hash.', false); return; }

  try {
    let result;

    if (algo === 'SHA256') {
      result = CryptoJS.SHA256(input).toString();

    } else if (algo === 'SHA512') {
      result = CryptoJS.SHA512(input).toString();

    } else {
      let salt = document.getElementById('hash-salt').value.trim();
      if (!salt) { genSalt(); salt = document.getElementById('hash-salt').value; }

      const salted = salt + input;
      const hash   = CryptoJS.SHA256(salted).toString();

      result = `SALT:  ${salt}\nHASH:  ${hash}`;
    }

    document.getElementById('hash-out').textContent = result;
    setStatus('hash-status', `✓ Hash computed using ${algo}.`, true);
  } catch(e) {
    setStatus('hash-status', '✗ Hashing error: ' + e.message, false);
  }
}

