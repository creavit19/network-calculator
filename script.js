var ew = {
    els: {},
    load: function () {
        let bypass = (knot) => {
            if (knot.id.length > 1) {
                const lb = document.getElementById(knot.id);
                const labels = knot.id.split("_");
                let nameEl = labels.pop();
                const k = Number(nameEl);
                if (!isNaN(k)) {
                    nameEl = labels.pop();
                    if (typeof this.els[nameEl] == "undefined") this.els[nameEl] = [];
                    this.els[nameEl][k] = lb;
                    Object.defineProperty(this.els[nameEl][k], 'labels', { value: labels });
                } else {
                    this.els[nameEl] = lb;
                    Object.defineProperty(this.els[nameEl], 'labels', { value: labels });
                }
            }
            for (const unit of knot.children) bypass(unit);
        };
        bypass(document.body);
    },
    iter: function (labels, fn) {
        if (typeof labels == "string") labels = [labels];
        function inc(arrA, arrB) { return (arrA.filter(x => arrB.includes(x))).length > 0 };
        for (const key in this.els) {
            if ( typeof this.els[key].labels == "undefined" ) {
                for (const k in this.els[key]) {
                    if ( inc( labels, this.els[key][k].labels ) ) fn( this.els[key][k], k );
                }
            } else {
            if ( inc( labels, this.els[key].labels ) ) fn( this.els[key], key );
            }
        }
    },
    init: function () {
        ew.load();
        ew.iter(["okt", "net"], function(el, nameEl) {
            let max = 255;
            if ( nameEl == "netSize" ) max = 32;
            el.onkeydown = function (e) {
                const et = el;
                ew.fns.checkP(et, e);
                ew.render();
            }
            el.oninput = function () {
                const et = el;
                const m = max;
                ew.fns.check(et, m);
                ew.render();
            }
            el.onchange = function () {
                const et = el;
                ew.fns.checkF(et);
                ew.render();
            }
            el.oldValue = el.value;
        });
        ew.render();
    },
    fns: {
        countHosts: function () {
            return Math.pow(2, 32 - Number(ew.els.netSize.value));
        },
        oktsToNum: function () {
            return Number(ew.els.ip[3].value) * 16777216
                + Number(ew.els.ip[2].value) * 65536
                + Number(ew.els.ip[1].value) * 256
                + Number(ew.els.ip[0].value);
        },
        numToOktArr: function (numAddr) {
            const result = [];
            for (let i = 3; i >= 0; i--) {
                const k = Math.pow(2, 8 * i);
                result[i] = parseInt(numAddr / k);
                numAddr -= result[i] * k;
            }
            return result;
        },
        numAddrToOut: function (numAddr) {
            const oktArr = ew.fns.numToOktArr(numAddr);
            for (let i = 3; i >= 0; i--) {
                ew.els.ip[i].value = ew.els.ip[i].oldValue = oktArr[i];
            }
        },
        numAddrToStr: function (numAddr) {
            const oktArr = ew.fns.numToOktArr(numAddr);
            let result = "";
            for (let i = 3; i >= 0; i--) {
                result += String(oktArr[i]) + (i == 0 ? "": ".");
            }
            return result;
        },
        range: function () {
            const a = ew.fns.oktsToNum();
            const c = ew.fns.countHosts();
            const n = c * parseInt(a / c);
            return {
                min: ew.fns.numAddrToStr(n),
                max: ew.fns.numAddrToStr(n + c - 1),
            };
        },
        netMask: function () {
            const netSize = Number(ew.els.netSize.value);
            let numAddr = 0;
            for (let i = 31; i >= (32 - netSize); i--) {
                numAddr += Math.pow(2, i);
            }
            return ew.fns.numAddrToStr(numAddr);
        },
        checkP: function (fl, e) {
            if (!((e.keyCode >= 48 && e.keyCode <= 57)
            || (e.keyCode >= 37 && e.keyCode <= 40)
            || (e.keyCode == 8)
            || (e.keyCode == 9)
            || (e.keyCode == 13)
            || (e.keyCode == 229)
            )) {
                e.preventDefault();
            }
        },
        check: function (fl, max) {
            if (!(fl.value === "")) {
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
            if (fl.value == "") {
                fl.oldValue = fl.value = 0;
            }
        },
    },
    ext: {
        incNetSize: function () {
            if (ew.els.netSize.value < 32) {
                ew.els.netSize.value++;
                ew.els.netSize.oldValue = ew.els.netSize.value;
                ew.render();
            }
        },
        decNetSize: function () {
            if (ew.els.netSize.value > 0) {
                ew.els.netSize.value--;
                ew.els.netSize.oldValue = ew.els.netSize.value;
                ew.render();
            }
        },
        incIP: function () {
            const n = ew.fns.oktsToNum() + ew.fns.countHosts();
            if (n > 4294967295) return;
            ew.fns.numAddrToOut(n);
            ew.render();
        },
        decIP: function () {
            const n = ew.fns.oktsToNum() - ew.fns.countHosts();
            if (n < 0) return;
            ew.fns.numAddrToOut(n);
            ew.render();
        },
    },
    render: function () {
        ew.els.outCountHosts.innerText = ew.fns.countHosts();
        ew.els.outNetMask.innerText = ew.fns.netMask();
        ew.els.outNetAddr.innerText = ew.fns.range().min + "/" + String(ew.els.netSize.value);
        ew.els.outAddrFrom.innerText = ew.fns.range().min;
        ew.els.outAddrTo.innerText = ew.fns.range().max;
    },
}
ew.init();
