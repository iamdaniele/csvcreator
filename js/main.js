function dragOverHandler(ev) {
  console.log('File(s) in drop zone');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function download(file) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(file)

  link.href = url
  link.download = file.name;
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}


function parseLinks(fileContents, name) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(fileContents, 'text/html');
  const out = [];
  doc.querySelectorAll('td > div > img').forEach(e => e.outerHTML = e.src.replaceAll(/w\d+\-h\d+$/g, 'w300-h300'));
  doc.querySelectorAll('tr').forEach(row => {
    out.push([...row.querySelectorAll('td')].map(cell => cell.innerText).join(','));
  });
  
  return new File([out.join('\n')], name.replace('.html', '.csv'));  
}

function readFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const csv = parseLinks(e.target.result, file.name);
    download(csv);
  };
  return reader.readAsText(file);
}

function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile();
        console.log(`… file[${i}].name = ${file.name}`);
        readFile(file);
      }
    });
  } else {
    // Use DataTransfer interface to access the file(s)
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`);
    });
  }
}

document.querySelector('input[type="file"]')?.addEventListener('change', e => {
  const file = e.target.files[0];
  console.log(`… file.name = ${file.name}`);
  readFile(file);
});
