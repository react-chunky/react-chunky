const path = require('path')
const fs = require('fs-extra')
const download = require('image-downloader')

class _ {
    constructor(data, props) {
        this._props = Object.assign({}, props)
        this._data = Object.assign({}, data)
    }

    get props() {
        return this._props
    }

    get data() {
        return this._data
    }

    createFile (filepath, data) {
        const file = path.resolve(process.cwd(), filepath)

        if (fs.existsSync(file)) {
            return false
        }

        const content = (path.extname(filepath).toLocaleUpperCase() === '.JSON' ? JSON.stringify(data, null, 2) : data)
        fs.writeFileSync(file, content, 'utf8')
     
        return fs.existsSync(file)
    }   

    generateFiles() {
        if (!this.props.files) {
            return Promise.reject(new Error(_.ERRORS.CANNOT_GENERATE('there are no files to be generated')))
        }

        return new Promise((resolve, reject) => {
            _.DIRS.map(dir => fs.existsSync(dir) || fs.mkdirsSync(dir))
            var files = []

            Object.keys(this.props.files).map(filepath => {
                if (!this.data[this.props.files[filepath]]) {
                    return
                }

                this.createFile(filepath, this.data[this.props.files[filepath]]) && files.push(filepath)
            })

            resolve(files)
        })        
    }

    generateAssets() {
        const dir = process.cwd()
        const assetsDir = path.resolve(dir, 'assets')
        
        var remoteAssets = []

        fs.existsSync(assetsDir) || fs.mkdirsSync(assetsDir)

        Object.keys(this.props.assets).map(asset => {
            const target = this.props.assets[asset]

            if (target === 'local') {
                fs.copySync(path.resolve(this.props.bundlePath, 'assets', asset), path.resolve(dir, 'assets', asset))
                return
            }

            remoteAssets.push({ url: target, dest: path.resolve(dir, 'assets', asset) })
        })

        return Promise.all(remoteAssets.map((asset) => download.image(asset)))
    }

    generate() {
        return Promise.all([this.generateFiles(), this.generateAssets()])
    }

}

_.DIRS = [".chunky/web", "node_modules", "web", "chunks", "assets/text"]
_.ERRORS = {
    CANNOT_GENERATE: (reason) => reason ? `Cannot generate files because ${reason}` : `Cannot generate files`
}

module.exports = _