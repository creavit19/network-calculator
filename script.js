var dt = {
    els: {
        inpNetSize: document.getElementById("netSize"),
        outCountHosts: document.getElementById("outCountHosts"),
        outNetMask: document.getElementById("outNetMask"),
        outNetAddr: document.getElementById("outNetAddr"),
        outAddrFrom: document.getElementById("outAddrFrom"),
        outAddrTo: document.getElementById("outAddrTo"),
        okt: [],
    },
    fns: {
        countHosts: function () {
            return Math.pow(2, 32 - Number(dt.els.inpNetSize.value));
        },
        oktsToNum: function () {
            return    Number(dt.els.okt[3].value) * 16777216
                    + Number(dt.els.okt[2].value) * 65536
                    + Number(dt.els.okt[1].value) * 256
                    + Number(dt.els.okt[0].value);
        },
        numToOktArr: function (numAddr) {
            const result = [];
            for ( let i = 3 ; i >= 0 ; i-- ) {
                const k = Math.pow(2, 8 * i);
                result[i] = parseInt( numAddr / k );
                numAddr -= result[i] * k;
            }
            return result;
        },
        numAddrToOut: function (numAddr) {
            const oktArr = dt.fns.numToOktArr(numAddr);
            for ( let i = 3 ; i >= 0 ; i-- ) {
                dt.els.okt[i].value = dt.els.okt[i].oldValue = oktArr[i];
            }
        },
        numAddrToStr: function (numAddr) {
            const oktArr = dt.fns.numToOktArr(numAddr);
            let result = "";
            for ( let i = 3 ; i >= 0 ; i-- ) {
                result += String(oktArr[i]) + (i == 0 ? "" : ".");
            }
            return result;
        },
        range: function () {
            const a = dt.fns.oktsToNum();
            const c = dt.fns.countHosts();
            const n = c * parseInt( a / c );
            return {
                min: dt.fns.numAddrToStr( n ),
                max: dt.fns.numAddrToStr( n + c - 1 ),
            };
        },
        netMask: function () {
            const netSize = Number( dt.els.inpNetSize.value );
            let numAddr = 0;
            for ( let i = 31 ; i >= (32 - netSize) ; i-- ) {
                numAddr += Math.pow(2, i);
            }
            return dt.fns.numAddrToStr( numAddr );
        },
        checkP: function (fl, e) {
            if ( !((e.keyCode >= 48 && e.keyCode <= 57)
                || (e.keyCode >= 37 && e.keyCode <= 40)
                || (e.keyCode == 8)
                || (e.keyCode == 9)
                || (e.keyCode == 13)
                || (e.keyCode == 229)
                ) ) {
                e.preventDefault();
            }
        },
        check: function (fl, max) {
            if ( !(fl.value === "") ) {
                fl.value = Number(fl.value);
                if (isNaN(fl.value)) {
                    fl.value = fl.oldValue;
                    return;
                }
                if (fl.value < 0) fl.value = 0;
                if (fl.value > max) fl.value = max;
            }
            fl.oldValue = fl.value;
        },
        checkF: function (fl) {
            if ( fl.value == "" ) {
                fl.oldValue = fl.value = 0;
            }
        },
    },
    ext: {
        incNetSize: function () {
            if (dt.els.inpNetSize.value < 32) {
                dt.els.inpNetSize.value++;
                dt.els.inpNetSize.oldValue = dt.els.inpNetSize.value;
                dt.render();
            }
        },
        decNetSize: function () {
            if (dt.els.inpNetSize.value > 0) {
                dt.els.inpNetSize.value--;
                dt.els.inpNetSize.oldValue = dt.els.inpNetSize.value;
                dt.render();
            }
        },
        incIP: function () {
            const n = dt.fns.oktsToNum() + dt.fns.countHosts();
            if ( n > 4294967295 ) return;
            dt.fns.numAddrToOut( n );
            dt.render();
        },
        decIP: function () {
            const n = dt.fns.oktsToNum() - dt.fns.countHosts();
            if ( n < 0 ) return;
            dt.fns.numAddrToOut( n );
            dt.render();
        },
    },
    render: function () {
        dt.els.outCountHosts.innerText = dt.fns.countHosts();
        dt.els.outNetMask.innerText = dt.fns.netMask();
        dt.els.outNetAddr.innerText = dt.fns.range().min + "/" + String(dt.els.inpNetSize.value);
        dt.els.outAddrFrom.innerText = dt.fns.range().min;
        dt.els.outAddrTo.innerText = dt.fns.range().max;
    },
}
for ( let i = 0; i <= 3; i++ ) {
    dt.els.okt[i] = document.getElementById("ip" + String(i));
    dt.els.okt[i].oldValue = dt.els.okt[i].value;
    dt.els.okt[i].onkeydown = function (e) {
        const n = i;
        dt.fns.checkP(dt.els.okt[n], e);
        dt.render();
    }
    dt.els.okt[i].oninput = function () {
        const n = i;
        dt.fns.check(dt.els.okt[n], 255);
        dt.render();
    }
    dt.els.okt[i].onchange = function () {
        const n = i;
        dt.fns.checkF(dt.els.okt[n]);
        dt.render();
    }
}
dt.els.inpNetSize.onkeydown = function (e) {
    dt.fns.checkP(dt.els.inpNetSize, e);
    dt.render();
}
dt.els.inpNetSize.oninput = function () {
    dt.fns.check(dt.els.inpNetSize, 32);
    dt.render();
}
dt.els.inpNetSize.onchange = function () {
    dt.fns.checkF(dt.els.inpNetSize);
    dt.render();
}
dt.els.inpNetSize.oldValue = dt.els.inpNetSize.value;
dt.render();
