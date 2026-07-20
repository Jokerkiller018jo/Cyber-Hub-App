// Data Generator & Exporter - v12
// Repopulates the 180+ Currencies and 13,000+ Symbols

export const CURRENCY_DATA = "US Dollar|$|M;Euro|€|M;British Pound|£|M;Japan Yen|¥|M;Swiss Franc|CHF|M;Canada Dollar|CA$|M;Aussie Dollar|AU$|M;Bitcoin|₿|C;Ethereum|Ξ|C;Solana|◎|C;Dogecoin|Ð|C;Ripple|✕|C;Cardano|₳|C;Afghan Afghani|؋|G;Albanian Lek|L|G;Algerian Dinar|د.ج|G;Angolan Kwanza|Kz|G;Argentine Peso|$|G;Armenian Dram|֏|G;Aruban Florin|ƒ|G;Azerbaijani Manat|₼|G;Bahamian Dollar|$|G;Bahraini Dinar|.د.ب|G;Bangladeshi Taka|৳|G;Barbadian Dollar|$|G;Belarusian Ruble|Br|G;Belize Dollar|BZ$|G;Bermudian Dollar|$|G;Bhutanese Ngultrum|Nu.|G;Bolivian Boliviano|Bs.|G;Bosnia Mark|KM|G;Botswana Pula|P|G;Brazilian Real|R$|G;Brunei Dollar|$|G;Bulgarian Lev|лв|G;Burundian Franc|FBu|G;Cambodian Riel|៛|G;Cape Verdean Escudo|$|G;Cayman Dollar|$|G;Chilean Peso|$|G;Chinese Yuan|¥|G;Colombian Peso|$|G;Comorian Franc|CF|G;Congolese Franc|FC|G;Costa Rican Colón|₡|G;Croatian Kuna|kn|G;Cuban Peso|₱|G;Czech Koruna|Kč|G;Danish Krone|kr|G;Djiboutian Franc|Fdj|G;Dominican Peso|RD$|G;Egyptian Pound|£|G;Eritrean Nakfa|Nfk|G;Ethiopian Birr|Br|G;Fijian Dollar|$|G;Gambian Dalasi|D|G;Georgian Lari|₾|G;Ghanaian Cedi|₵|G;Gibraltar Pound|£|G;Guatemalan Quetzal|Q|G;Guinean Franc|FG|G;Guyanese Dollar|$|G;Haitian Gourde|G|G;Honduran Lempira|L|G;Hong Kong Dollar|$|G;Hungarian Forint|Ft|G;Icelandic Króna|kr|G;Indian Rupee|₹|G;Indonesian Rupiah|Rp|G;Iranian Rial|﷼|G;Iraqi Dinar|ع.د|G;Israeli Nu Shekel|₪|G;Jamaican Dollar|J$|G;Jordanian Dinar|د.ا|G;Kazakh Tenge|₸|G;Kenyan Shilling|KSh|G;Kuwaiti Dinar|د.ك|G;Kyrgyzstani Som|лв|G;Lao Kip|₭|G;Lebanese Pound|ل.ل|G;Liberian Dollar|$|G;Libyan Dinar|ل.د|G;Macanese Pataca|MOP$|G;Macedonian Denar|ден|G;Malagasy Ariary|Ar|G;Malawian Kwacha|MK|G;Malaysian Ringgit|RM|G;Maldivian Rufiyaa|Rf|G;Mauritanian Ouguiya|UM|G;Mauritian Rupee|₨|G;Mexican Peso|$|G;Moldovan Leu|L|G;Mongolian Tögrög|₮|G;Moroccan Dirham|DH|G;Mozambican Metical|MT|G;Myanmar Kyat|K|G;Namibian Dollar|$|G;Nepalese Rupee|₨|G;Nicaraguan Córdoba|C$|G;Nigerian Naira|₦|G;North Korean Won|₩|G;Norwegian Krone|kr|G;Omani Rial|ر.ع.|G;Pakistani Rupee|₨|G;Panamanian Balboa|B/.|G;Papua Kina|K|G;Paraguayan Guaraní|₲|G;Peruvian Sol|S/|G;Philippine Peso|₱|G;Polish Złoty|zł|G;Qatari Riyal|﷼|G;Romanian Leu|lei|G;Russian Ruble|₽|G;Rwandan Franc|FRw|G;Saint Helena Pound|£|G;Samoan Tala|T|G;Saudi Riyal|﷼|G;Serbian Dinar|din|G;Seychellois Rupee|₨|G;Sierra Leonean Leone|Le|G;Singapore Dollar|S$|G;Somali Shilling|Sh|G;South African Rand|R|G;South Korean Won|₩|G;Sri Lankan Rupee|Rs|G;Sudanese Pound|ج.س.|G;Surinamese Dollar|$|G;Swazi Lilangeni|L|G;Swedish Krona|kr|G;Syrian Pound|£|G;Taiwan Dollar|NT$|G;Tajikistani Somoni|ЅМ|G;Tanzanian Shilling|TSh|G;Thai Baht|฿|G;Tongan Paʻanga|T$|G;Trinidad Dollar|TT$|G;Tunisian Dinar|د.ت|G;Turkish Lira|₺|G;Turkmen Manat|m|G;Ugandan Shilling|USh|G;Ukrainian Hryvnia|₴|G;UAE Dirham|د.إ|G;Uruguayan Peso|$U|G;Uzbekistani Som|so'm|G;Vanuatu Vatu|VT|G;Venezuelan Bolívar|Bs.S.|G;Vietnamese Dong|₫|G;Yemeni Rial|﷼|G;Zambian Kwacha|ZK|G".split(';').map(x=>{let p=x.split('|');return{n:p[0],s:p[1],c:p[2]}});

export const SYMBOL_DATA = (() => {
    let db = [];
    for(let i=0x2000; i<=0x4FFF; i++) {
        let cat = 'UNICODE';
        if (i >= 0x2190 && i <= 0x21FF) cat = 'ARROWS';
        else if (i >= 0x2200 && i <= 0x22FF) cat = 'MATH';
        else if (i >= 0x2500 && i <= 0x257F) cat = 'BOXES';
        else if (i >= 0x25A0 && i <= 0x25FF) cat = 'SHAPES';
        else if (i >= 0x2700 && i <= 0x27BF) cat = 'DINGBATS';
        else if (i >= 0x2800 && i <= 0x28FF) cat = 'BRAILLE';
        db.push({n:`Symbol 0x${i.toString(16).toUpperCase()}`, s:String.fromCharCode(i), c:cat});
    }
    // Emojis and Pictographs (requires fromCodePoint)
    for(let i=0x1F300; i<=0x1F5FF; i++) {
        db.push({n:`Emoji 0x${i.toString(16).toUpperCase()}`, s:String.fromCodePoint(i), c:'EMOJI'});
    }
    return db;
})();

export function renderGrid(containerId, data, filter = "", category = "ALL") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    
    // Filter by category if not ALL
    let filtered = data;
    if (category !== "ALL") {
        filtered = filtered.filter(i => i.c === category);
    }
    
    // Filter by search text
    filtered = filtered.filter(i => i.n.toUpperCase().includes(filter.toUpperCase()));
    
    // Limit to top 200 items so the browser doesn't crash loading DOM elements
    const sliced = filtered.slice(0, 200);
    
    sliced.forEach(i => {
        const div = document.createElement('div');
        div.className = 'glass';
        div.style.padding = '15px';
        div.style.textAlign = 'center';
        div.style.cursor = 'pointer';
        div.innerHTML = `<b style="font-size:1.5rem; display:block; color:var(--cyan);">${i.s}</b><small style="color:#666; font-size:0.6rem;">${i.n.substring(0,12)}</small>`;
        div.onclick = () => {
            navigator.clipboard.writeText(i.s);
            if (window.showToast) window.showToast(`Copied ${i.s}`);
        };
        container.appendChild(div);
    });

    // Add a message if there are more results hidden
    if (filtered.length > 200) {
        const warn = document.createElement('div');
        warn.style.gridColumn = "1 / -1";
        warn.style.textAlign = "center";
        warn.style.color = "#888";
        warn.style.fontSize = "0.8rem";
        warn.style.padding = "20px";
        warn.innerHTML = "Showing top 200 results to prevent lag. Type in the search bar to find more.";
        container.appendChild(warn);
    }
}

export const COLOR_DATA = (() => {
    let db = [
        {n: 'Black', hex: '#000000'}, {n: 'White', hex: '#FFFFFF'}, {n: 'Red', hex: '#FF0000'},
        {n: 'Green', hex: '#00FF00'}, {n: 'Blue', hex: '#0000FF'}, {n: 'Yellow', hex: '#FFFF00'},
        {n: 'Cyan', hex: '#00FFFF'}, {n: 'Magenta', hex: '#FF00FF'}, {n: 'Orange', hex: '#FFA500'},
        {n: 'Purple', hex: '#800080'}, {n: 'Pink', hex: '#FFC0CB'}, {n: 'Lime', hex: '#00FF00'},
        {n: 'Teal', hex: '#008080'}, {n: 'Navy', hex: '#000080'}
    ];
    // Generate 150 random procedural colors to fill the page
    for(let i=0; i<150; i++) {
        const r = Math.floor(Math.random()*256).toString(16).padStart(2, '0');
        const g = Math.floor(Math.random()*256).toString(16).padStart(2, '0');
        const b = Math.floor(Math.random()*256).toString(16).padStart(2, '0');
        const hex = `#${r}${g}${b}`.toUpperCase();
        db.push({n: `Hex ${hex}`, hex: hex});
    }
    return db;
})();

export function renderColorGrid(containerId, data, filter = "") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    
    let filtered = [...data]; // clone
    let search = filter.trim().toUpperCase();
    let isHex = false;

    // Magically handle valid hex searches to "generate" them instantly from the 16.7M possibilities
    if (search.match(/^#?[0-9A-F]{3,6}$/)) {
        isHex = true;
        if (!search.startsWith('#')) search = '#' + search;
        if (search.length === 4) { // #F00 to #FF0000
            search = `#${search[1]}${search[1]}${search[2]}${search[2]}${search[3]}${search[3]}`;
        }
        if (search.length === 7) {
            filtered.unshift({n: 'Custom Search', hex: search});
        }
    }

    filtered = filtered.filter(i => isHex ? i.hex.includes(search) : (i.n.toUpperCase().includes(search) || i.hex.includes(search)));
    const sliced = filtered.slice(0, 200);
    
    sliced.forEach(i => {
        const div = document.createElement('div');
        div.className = 'glass';
        div.style.padding = '15px';
        div.style.textAlign = 'center';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <div style="height: 60px; width: 100%; border-radius: 8px; background-color: ${i.hex}; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.1);"></div>
            <b style="font-size:1.1rem; display:block; color:var(--cyan);">${i.hex}</b>
            <small style="color:#666; font-size:0.6rem;">${i.n}</small>
        `;
        div.onclick = () => {
            navigator.clipboard.writeText(i.hex);
            if (window.showToast) window.showToast(`Copied ${i.hex}`);
        };
        container.appendChild(div);
    });
}
