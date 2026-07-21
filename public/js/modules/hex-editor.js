// Cyber Hex Editor (File Analyzer)

let currentFileBuffer = null;
let currentViewOffset = 0;
const BYTES_PER_ROW = 16;
const ROWS_PER_PAGE = 50;
const PAGE_SIZE = BYTES_PER_ROW * ROWS_PER_PAGE;
let currentSearchMatches = [];
let currentSearchIndex = 0;

export function initHexEditor() {
    const dropzone = document.getElementById('hex-dropzone');
    const fileInput = document.getElementById('hex-file-input');
    const prevBtn = document.getElementById('hex-prev-btn');
    const nextBtn = document.getElementById('hex-next-btn');
    const pageInfo = document.getElementById('hex-page-info');
    const searchInput = document.getElementById('hex-search-input');
    const searchBtn = document.getElementById('hex-search-btn');

    if (!dropzone) return;

    // Drag & Drop Handlers
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "var(--cyan)";
        dropzone.style.background = "rgba(0, 255, 136, 0.1)";
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "var(--magenta)";
        dropzone.style.background = "transparent";
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "var(--magenta)";
        dropzone.style.background = "transparent";
        if (e.dataTransfer.files.length > 0) {
            loadFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadFile(e.target.files[0]);
        }
    });

    // Click to upload
    dropzone.addEventListener('click', () => fileInput.click());

    // Pagination
    prevBtn.addEventListener('click', () => {
        if (currentViewOffset >= PAGE_SIZE) {
            currentViewOffset -= PAGE_SIZE;
            renderHexView();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentFileBuffer && currentViewOffset + PAGE_SIZE < currentFileBuffer.length) {
            currentViewOffset += PAGE_SIZE;
            renderHexView();
        }
    });

    // Search
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim().toUpperCase().replace(/\s+/g, '');
        if (!query) return;
        performHexSearch(query);
    });
}

function loadFile(file) {
    if (window.showToast) window.showToast(`Loading ${file.name}...`);
    
    // For v1, limit to 50MB to prevent browser crash reading massive ArrayBuffers
    const MAX_SIZE = 50 * 1024 * 1024; 
    let slice = file;
    if (file.size > MAX_SIZE) {
        if (window.showToast) window.showToast("File > 50MB. Only analyzing first 50MB.");
        slice = file.slice(0, MAX_SIZE);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentFileBuffer = new Uint8Array(e.target.result);
        currentViewOffset = 0;
        currentSearchMatches = [];
        currentSearchIndex = 0;
        
        document.getElementById('hex-file-name').innerText = `File: ${file.name} (${(currentFileBuffer.length / 1024).toFixed(2)} KB)`;
        document.getElementById('hex-dropzone-container').style.display = 'none';
        document.getElementById('hex-viewer-container').style.display = 'flex';
        
        renderHexView();
    };
    reader.onerror = () => {
        if (window.showToast) window.showToast("Error reading file.");
    };
    reader.readAsArrayBuffer(slice);
}

function renderHexView() {
    if (!currentFileBuffer) return;

    const offsetCol = document.getElementById('hex-col-offset');
    const hexCol = document.getElementById('hex-col-bytes');
    const asciiCol = document.getElementById('hex-col-ascii');
    const pageInfo = document.getElementById('hex-page-info');

    let offsetHTML = '';
    let hexHTML = '';
    let asciiHTML = '';

    const endOffset = Math.min(currentViewOffset + PAGE_SIZE, currentFileBuffer.length);
    
    for (let i = currentViewOffset; i < endOffset; i += BYTES_PER_ROW) {
        // Offset
        offsetHTML += `<div>${i.toString(16).padStart(8, '0').toUpperCase()}</div>`;
        
        // Bytes & ASCII
        let byteRow = '';
        let asciiRow = '';
        for (let j = 0; j < BYTES_PER_ROW; j++) {
            if (i + j < currentFileBuffer.length) {
                const byte = currentFileBuffer[i + j];
                const hexStr = byte.toString(16).padStart(2, '0').toUpperCase();
                
                // Highlight logic
                let isMatch = false;
                for (let match of currentSearchMatches) {
                    if (i + j >= match.start && i + j < match.start + match.length) {
                        isMatch = true;
                        break;
                    }
                }

                const spanClass = isMatch ? 'hex-byte match' : 'hex-byte';
                byteRow += `<span class="${spanClass}" data-offset="${i+j}">${hexStr}</span> `;
                
                // ASCII
                if (byte >= 32 && byte <= 126) {
                    asciiRow += String.fromCharCode(byte).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                } else {
                    asciiRow += '.';
                }
            } else {
                byteRow += `<span class="hex-byte empty">00</span> `;
                asciiRow += '&nbsp;';
            }
        }
        hexHTML += `<div>${byteRow}</div>`;
        asciiHTML += `<div>${asciiRow}</div>`;
    }

    offsetCol.innerHTML = offsetHTML;
    hexCol.innerHTML = hexHTML;
    asciiCol.innerHTML = asciiHTML;

    const totalPages = Math.ceil(currentFileBuffer.length / PAGE_SIZE);
    const currentPage = Math.floor(currentViewOffset / PAGE_SIZE) + 1;
    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
}

function performHexSearch(hexString) {
    if (!currentFileBuffer) return;
    
    // Convert hex string (e.g. "FFD8FFE0") to byte array
    if (hexString.length % 2 !== 0) {
        if (window.showToast) window.showToast("Invalid Hex: Must be even length.");
        return;
    }

    const searchBytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
        searchBytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    currentSearchMatches = [];
    
    // Basic linear search
    for (let i = 0; i <= currentFileBuffer.length - searchBytes.length; i++) {
        let match = true;
        for (let j = 0; j < searchBytes.length; j++) {
            if (currentFileBuffer[i + j] !== searchBytes[j]) {
                match = false;
                break;
            }
        }
        if (match) {
            currentSearchMatches.push({ start: i, length: searchBytes.length });
        }
        if (currentSearchMatches.length > 500) {
            if (window.showToast) window.showToast("Found >500 matches. Stopping search.");
            break;
        }
    }

    if (currentSearchMatches.length === 0) {
        if (window.showToast) window.showToast("No matches found.");
    } else {
        if (window.showToast) window.showToast(`Found ${currentSearchMatches.length} matches!`);
        // Jump to first match
        currentViewOffset = Math.floor(currentSearchMatches[0].start / PAGE_SIZE) * PAGE_SIZE;
        renderHexView();
    }
}
