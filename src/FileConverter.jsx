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
        return (
            <div className="container mx-auto mt-8">
                <h1 className="text-2xl font-bold mb-4">File Converter</h1>
                <div>
                    <label>Select File:</label>
                    <input type="file" onChange={this.handleFileChange} />
                </div>
                <div className="mt-4">
                    <label>Select Conversion Format:</label>
                    <select value={this.state.conversionFormat} onChange={this.handleConversionChange}>
                        <option value="">Select format...</option>
                        <option value="pdf">PDF</option>
                        <option value="docx">DOCX</option>
                        <option value="txt">TXT</option>
                        <option value="html">HTML</option>
                    </select>
                </div>
                <div className="mt-4">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={this.convertFile}>Convert File</button>
                </div>
            </div>
        );
    }
}

export default FileConverter;
