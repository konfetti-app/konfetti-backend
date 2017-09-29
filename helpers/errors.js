function formatError (v) {
  let err = {};
  if (v.type) {
    err.type = v.type;
  } else {
    if (typeof v.toJSON === 'function' && v.toString === 'function') {
      //  console.log('a function! returning ' + JSON.stringify(v.toJSON()));

      err.type= v.toString().match(/(collection|mongo|duplicate)/) ? 'mongodb' : undefined,
      err.message= v.toJSON().messge || v.toJSON().errmsg || v.toJSON() || v

    } else {
      //  console.log('_not_ a function!');
      err.type= String(v).match(/(collection|mongo|duplicate)/) ? 'mongodb' : undefined,
      err.message= v.messge || v.errmsg || v

    }
  }
  if (v.message) err.message = v.message;
  return err;
}

exports.formatError = formatError;
