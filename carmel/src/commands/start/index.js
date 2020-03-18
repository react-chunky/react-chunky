const Carmel = require('@carmel/sdk')
const Script = require('../../Script')

class _ extends Carmel.Commands.Start {

  constructor(args) {
      super(args)
      this._script = new Script(args)
    }

    get script() {
      return this._script
    }

    get target() {
      return this.script.target
    }

    exec(session) {
      return Promise.all([super.exec(session), this.script.load(session)])
                    .then(([script, props]) => run({ session, script, props }))
   }
}

module.exports = _
