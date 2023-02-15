export function toDataURL(url: string, callback: Function) {
    fetch(url).then((res) => {
        let reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        res.blob().then((data) => {
            reader.readAsDataURL(data)
        })
    })
}