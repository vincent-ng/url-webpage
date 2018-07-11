/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax */
const lzmaD = require('exports-loader?this.LZMA!lzma/src/lzma-d.js')
const lzmaC = require('exports-loader?this.LZMA!lzma/src/lzma-c.js')

function base64ToByteArray(base64) {
	const raw = window.atob(base64)
	const rawLength = raw.length
	const array = new Uint8Array(new ArrayBuffer(raw.length))
	for (let i = 0; i < rawLength; i += 1) {
		array[i] = raw.charCodeAt(i)
	}
	return array
}

function byteArrayToBase64(array) {
	return window.btoa(String.fromCharCode.apply(null, new Uint8Array(array)))
}

function decompress(array) {
	return new Promise((rs, rj) => {
		lzmaD.decompress(array, (result, err) => {
			if (err) {
				rj(err)
			} else {
				rs(result)
			}
		})
	})
}

function compress(string) {
	return new Promise((rs, rj) => {
		lzmaC.compress(string, 9, (result, err) => {
			if (err) {
				rj(err)
			} else {
				rs(result)
			}
		})
	})
}

async function base64ToContent(base64) {
	if (!base64) { return '' }
	const array = base64ToByteArray(base64)
	const content = await decompress(array)
	return content
}

async function contentToBase64(content) {
	const array = await compress(content)
	return byteArrayToBase64(array)
}

module.exports = {
	// base64ToByteArray,
	// byteArrayToBase64,
	// decompress,
	// compress,
	base64ToContent,
	contentToBase64,
}
