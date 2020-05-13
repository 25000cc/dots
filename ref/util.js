const chunk = (arr, n) => {
    const len = Math.round(arr.length / n);
    const ret = [];
    for (let i = 0; i < len; i++) {
        ret.push(arr.slice(i * n, i * n + n));
    }
    return ret;
};
//# sourceMappingURL=util.js.map