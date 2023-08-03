# sample code to send a shell script to the actions using Flask
from flask import Flask, send_file

app = Flask(__name__)

# Replace 'path/to/your/file.pdf' with the actual path to the file you want to serve
file_path = 'C:/Users/sasan/Desktop/ardrive.bat'


@app.route('/download', methods=['GET'])
def download_file():
    try:
        # The 'as_attachment' argument makes sure the file is treated as an attachment
        # and will be downloaded by the client rather than displayed in the browser
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return str(e), 404


if __name__ == '__main__':
    app.run(debug=True)
