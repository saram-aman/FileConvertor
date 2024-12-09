import React, { Component } from 'react';
import { saveAs } from 'file-saver';
import { PDFDocument, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';
import Dropzone from 'react-dropzone';

class FileConverter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            conversionFormat: '',
            loading: false,
            queue: [],
        };
    }

    handleFileChange = (acceptedFiles) => {
        this.setState({ file: acceptedFiles[0] });
    };

    handleConversionChange = (event) => {
        this.setState({ conversionFormat: event.target.value });
    };

    fileRenaming = (filename) => {
        let parts = filename.split('.');
        parts.pop();
        return parts.join('.');
    };

    wrapInHtml = async (content, fileName) => {
        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${this.fileRenaming(fileName)}</title>
                </head>
                <body>
                    <pre>${content}</pre>
                </body>
            </html>
        `;
    };

    convertFile = async () => {
        try {
            const { file, conversionFormat, queue } = this.state;
            if (!file || !conversionFormat) {
                alert('Please select a file and choose a conversion format.');
                return;
            }

            this.setState({ loading: true, queue: [...queue, { fileName: file.name, status: 'In Progress' }] });
            try {
                switch (conversionFormat) {
                    case 'pdf':
                        await this.convertToPDF(file);
                        break;
                    case 'docx':
                        await this.convertToDocx(file);
                        break;
                    case 'txt':
                        await this.convertToTxt(file);
                        break;
                    case 'html':
                        await this.convertTOHtml(file);
                        break;
                    // Add cases for other formats as needed
                    default:
                        alert('Unsupported conversion format.');
                        return;
                }
                this.updateQueue(file.name, 'Completed');
            } catch (error) {
                console.error('Error converting file:', error);
                alert('Error converting file. Please try again.');
                this.updateQueue(file.name, 'Failed');
            } finally {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error('Error converting file:', error);
        }
    };

    updateQueue = (fileName, status) => {
        this.setState((prevState) => ({
            queue: prevState.queue.map((item) => (item.fileName === fileName ? { ...item, status } : item)),
        }));
    };

    convertToPDF = async (file) => {
        try {
            const fileContent = await this.readFileContent(file);
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const textContent = fileContent.toString();
            page.drawText(textContent, {
                x: 50,
                y: page.getHeight() - 50,
                size: 12,
                color: rgb(0, 0, 0),
            });
            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), this.fileRenaming(file.name) + '.pdf');
        } catch (error) {
            console.error('Error converting to PDF:', error);
        }
    };

    convertToDocx = async (file) => {
        try {
            const fileContent = await this.readFileContent(file);
            const docs = new Document();
            const paragraph = new Paragraph(fileContent);
            docs.addSection({
                children: [paragraph]
            });
            const blob = await Packer.toBlob(docs);
            saveAs(new Blob([blob], { type: 'application/docx' }), this.fileRenaming(file.name) + '.docx');
        } catch (error) {
            console.error('Error converting to DOCX:', error);
        }
    };

    convertToTxt = async (file) => {
        try {
            const fileContent = await this.readFileContent(file);
            const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, this.fileRenaming(file.name) + '.txt');
        } catch (error) {
            console.error('Error converting to TXT:', error);
        }
    }

    convertTOHtml = async (file) => {
        try {
            const fileContent = await this.readFileContent(file);
            const htmlContent = await this.wrapInHtml(fileContent, file.name);
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8'});
            saveAs(blob, this.fileRenaming(file.name) + '.html');
        } catch (error) {
            console.error('Error converting to HTML:', error);
        }
    }

    readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    render() {
        const { loading, conversionFormat, queue } = this.state;
        return (
            <div className="container mx-auto mt-8 p-6 bg-white rounded shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">File Converter</h1>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Select File:</label>
                    <Dropzone onDrop={this.handleFileChange}>
                        {({ getRootProps, getInputProps }) => (
                            <div {...getRootProps()} className="border-dashed border-4 border-gray-300 p-6 text-center cursor-pointer rounded">
                                <input {...getInputProps()} />
                                <p>Drag & drop a file here, or click to select a file</p>
                            </div>
                        )}
                    </Dropzone>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Select Conversion Format:</label>
                    <select value={conversionFormat} onChange={this.handleConversionChange} className="w-full p-2 border border-gray-300 rounded">
                        <option value="">Select format...</option>
                        <option value="pdf">PDF</option>
                        <option value="docx">DOCX</option>
                        <option value="txt">TXT</option>
                        <option value="html">HTML</option>
                    </select>
                </div>
                <div className="mb-4">
                    <button onClick={this.convertFile} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Convert File</button>
                </div>
                {loading && (
                    <div className="flex justify-center items-center mt-4">
                        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500" role="status"></div>
                    </div>
                )}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">Conversion Queue:</h2>
                    <ul className="list-disc list-inside">
                        {queue.map((item, index) => (
                            <li key={index} className="flex justify-between">
                                <span>{item.fileName}</span>
                                <span className={`font-semibold ${item.status === 'Completed' ? 'text-green-500' : item.status === 'Failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                                  {item.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default FileConverter;
