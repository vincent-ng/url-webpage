require('medium-editor/dist/css/medium-editor.css')
require('medium-editor/dist/css/themes/default.css')
// require('bootstrap')
require('bootstrap/dist/css/bootstrap.css')
const $ = require('jquery')
const _ = require('lodash')
const MediumEditor = require('medium-editor')
const editorHtml = require('html-loader!./editor.html') // eslint-disable-line import/no-unresolved, import/no-webpack-loader-syntax
const viewerHtml = require('html-loader!./viewer.html') // eslint-disable-line import/no-unresolved, import/no-webpack-loader-syntax
const { base64ToContent, contentToBase64 } = require('./crypto.js')

async function initViewer(title, compressed) {
	$('title').html(title)
	$('#viewer #title').html(title)
	const content = await base64ToContent(compressed)
	$('#viewer #content').html(content)
}

async function update() {
	const title = $('#editor #title').val()
	const titleEncode = encodeURIComponent(title)
	const html = $('#editor #content').html()
	const hash = await contentToBase64(html)
	$('title').html(title)
	$('#info #title').html(title || 'untitle')
	$('#info #content').html(html)
	$('#info #content-length').html(html.length)
	$('#info #hash-length').html(hash.length)
	$('#info #preview').attr('href', `#${titleEncode}/${hash}`)
	window.location.hash = `${titleEncode}/?${hash}`
}

async function initEditor(title, compressed) {
	$('title').html(title)
	$('#editor #title').val(title)

	const delayUpdate = _.debounce(update, 1000)
	$('#editor #title').keyup(delayUpdate).change(delayUpdate)

	const content = await base64ToContent(compressed)
	const editor = new MediumEditor('#editor #content', {
		toolbar: {
			buttons: [
				'justifyLeft',
				'justifyCenter',
				'justifyRight',
				// 'justifyFull',
				'bold',
				'italic',
				'underline',
				'anchor',
				'orderedlist',
				'unorderedlist',
				// 'h1',
				'h2',
				'h3',
				'indent',
				'outdent',
				'quote',
				'pre',
				'html',
				'removeFormat',
			],
		},
	})

	editor.subscribe('editableInput', delayUpdate)
	editor.setContent(content)
	update() // initial refresh, without delay
}

$(async () => {
	const app = $('#brickyard-app')

	const match = /^#([^/]*)\/(\??)(.+)$/.exec(window.location.hash) || [undefined, '', '?', '']
	const [, title, editable, compressed] = match

	const titleDecode = decodeURIComponent(title)
	if (!editable) {
		app.html(viewerHtml)
		initViewer(titleDecode, compressed)
	} else {
		app.html(editorHtml)
		initEditor(titleDecode, compressed)
	}
})
