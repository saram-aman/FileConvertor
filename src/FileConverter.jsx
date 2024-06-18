import React, { Component } from 'react';
import { saveAs } from 'file-saver';
import { PDFDocument, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';

class FileConverter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            conversionFormat: '',
            loading: false,
        };
    }

    handleFileChange = (event) => {
        const file = event.target.files[0];
        this.setState({ file });
    };

    handleConversionChange = (event) => {
        const conversionFormat = event.target.value;
        this.setState({ conversionFormat });
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
            const { file, conversionFormat } = this.state;
            if (!file || !conversionFormat) {
                alert('Please select a file and choose a conversion format.');
                return;
            }

            this.setState({ loading: true });
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
            } catch (error) {
                console.error('Error converting file:', error);
                alert('Error converting file. Please try again.');
            } finally {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error('Error converting file:', error);
        }
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
        const { loading, conversionFormat } = this.state
        return (
            <div className="container mx-auto mt-8 p-6 bg-white rounded shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">File Converter</h1>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Select File:</label>
                    <input type="file" className="w-full p-2 border border-gray-300 rounded" onChange={this.handleFileChange} />
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
                    <ul className="list-disc list-inside"></ul>
                </div>
            </div>
        );
    }
}

export default FileConverter;
