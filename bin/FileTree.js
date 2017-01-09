'use strict'

/**
 * File/Folder tree
 */
class FileTree
{
    /**
     * Create tree and add ./ folder
     * @param {Object} _options
     * @param {Boolean} _options.autoWash - Should clean empty folder on removes
     */
    constructor( _options = {} )
    {
        if( typeof _options !== 'object' )
        {
            console.warn( 'constructor: _options should be an object' )
            return false
        }

        // Options
        this.autoWash = typeof _options.autoWash === 'undefined' ? false : _options.autoWash

        // Set up
        this.folders = {}

        // Initial folder
        this.addFolder( '.', {} )
    }

    /**
     * Clean path
     * @param {String} _path - Path to clean
     * @return {String} Cleaned path
     */
    cleanPath( _path )
    {
        // Errors
        if( typeof _path !== 'string' )
        {
            console.warn( 'cleanPath: _path should be a string' )
            return false
        }

        // Trim
        _path = _path.trim()

        // Repeating `/`
        _path = _path.replace( /\/+/g, '/' )

        // Ending `/`
        _path = _path.replace( /\/$/, '' )

        // Starting `/`
        _path = _path.replace( /^\//, '' )

        // Missing starting `./`
        if( _path !== '.' && _path.search( './' ) !== 0 )
            _path = './' + _path

        return _path
    }

    /**
     * Add a folder
     * Can create nested folder in one path
     * @param {String} _path - Path to the folder (start with `./`)
     * @param {Object} _data - Properties to add to the folder
     * @returns {Object} Created folder
     */
    addFolder( _path, _data = {} )
    {
        // Errors
        if( typeof _path !== 'string' )
        {
            console.warn( 'addFolder: _path should be a string' )
            return false
        }
        if( typeof _data !== 'object' )
        {
            console.warn( 'addFolder: _data should be an object' )
            return false
        }

        // Set up
        let path      = this.cleanPath( _path ),
            pathParts = path.split( '/' ),
            folders   = this.folders,
            folder    = null

        // Each path part
        for( let _part of pathParts )
        {
            // Already exist
            if( typeof folders[ _part ] !== 'undefined' )
            {
                folder  = folders[ _part ]
                folders = folder.folders
            }

            // Folder doesn't exist
            else
            {
                // Create folder
                folder = {
                    folders: {},
                    files  : {},
                    name   : _part,
                    data   : _data
                }

                // Save
                folders[ _part ] = folder
                folders = folder.folders
            }
        }

        // Return
        return folder
    }

    /**
     * Add a file
     * Will create folders if needed
     * @param {String} _path - Path to the folder (start with `./`)
     * @param {Object} _data - Properties to add to the file
     * @returns {Object} Created file
     */
    addFile( _path, _data = {} )
    {
        // Errors
        if( typeof _path !== 'string' )
        {
            console.warn( 'addFile: _path should be a string' )
            return false
        }
        if( typeof _data !== 'object' )
        {
            console.warn( 'addFile: _data should be an object' )
            return false
        }

        // Set up
        let path      = this.cleanPath( _path ),
            pathParts = path.split( '/' ),
            filePart  = pathParts.pop()

        // Create folder
        let folder = this.addFolder( pathParts.join( '/' ) )

        // Create file
        let file = {
            name: filePart,
            data: _data
        }

        // Save
        folder.files[ filePart ] = file

        return file
    }

    /**
     * Remove folder
     * Will delete contained folders and contained files
     * @param {String} _path - Folder to delete (start with `./`)
     * @returns {Boolean} Folder deleted or not
     */
    removeFolder( _path )
    {
        // Recursive emptying
        function emptyFolder( folder )
        {
            // Delete folders
            for( let _folderKey in folder.folders )
            {
                let _folder = folder.folders[ _folderKey ]

                emptyFolder( _folder )

                delete folder.folders[ _folderKey ]

                // Callback
                if( typeof _folder.data.onRemove === 'function' )
                {
                    _folder.data.onRemove.apply( this, [ _folder ] )
                }
            }

            // Delete files
            for( let _fileKey in folder.files )
            {
                let _file = folder.files[ _fileKey ]

                delete folder.files[ _fileKey ]

                // Callback
                if( typeof _file.data.onRemove === 'function' )
                {
                    _file.data.onRemove.apply( this, [ _file ] )
                }
            }
        }

        // Errors
        if( typeof _path !== 'string' )
        {
            console.warn( 'removeFolder: _path should be a string' )
            return false
        }

        // Set up
        let path       = this.cleanPath( _path ),
            pathParts  = path.split( '/' ),
            folderPart = pathParts.pop(),
            folders    = this.folders,
            folder     = null

        // Each path part
        for( let _part of pathParts )
        {
            // Found
            if( typeof folders[ _part ] !== 'undefined' )
            {
                folder  = folders[ _part ]
                folders = folder.folders
            }

            // Not found
            else
            {
                folder  = null
                folders = null
                break
            }
        }

        // Found
        if( folders && folders[ folderPart ] )
        {
            let folder = folders[ folderPart ]

            // Delete
            emptyFolder( folder )
            delete folders[ folderPart ]

            // Callback
            if( typeof folder.data.onRemove === 'function' )
            {
                folder.data.onRemove.apply( this, [ folder ] )
            }

            // Auto wash
            if( this.autoWash )
                this.removeEmptyFolders()

            return true
        }

        return false
    }

    /**
     * Remove file
     * Will delete contained folders and contained files
     * @param {String} _path - File to delete (start with `./`)
     * @returns {Boolean} File deleted or not
     */
    removeFile( _path )
    {
        // Errors
        if( typeof _path !== 'string' )
        {
            console.warn( 'removeFile: _path should be a string' )
            return false
        }

        // Set up
        let path      = this.cleanPath( _path ),
            pathParts = path.split( '/' ),
            filePart  = pathParts.pop(),
            folders   = this.folders,
            folder    = null

        // Each path part
        for( let _part of pathParts )
        {
            // Found
            if( typeof folders[ _part ] !== 'undefined' )
            {
                folder  = folders[ _part ]
                folders = folder.folders
            }

            // Not found
            else
            {
                folder  = null
                folders = null
                break
            }
        }

        // Folder found
        if( folders && folder )
        {
            let file = folder.files[ filePart ]

            if( typeof file !== 'undefined' )
            {
                // Delete
                delete folder.files[ filePart ]

                // Auto wash
                if( this.autoWash )
                    this.removeEmptyFolders()

                // Callback
                if( typeof file.data.onRemove === 'function' )
                {
                    file.data.onRemove.apply( this, [ file ] )
                }

                return true
            }
        }

        return false
    }

    /**
     * Get file
     * @param {String} _path - Path to file
     * @returns {Object} File
     */
    getFile( _path )
    {
        // Errors
        if( typeof _path !== 'string' )
        {
            console.warn( 'getFile: _path should be a string' )
            return false
        }

        // Set up
        let path      = this.cleanPath( _path ),
            pathParts = path.split( '/' ),
            filePart  = pathParts.pop(),
            folders   = this.folders,
            folder    = null

        // Each path part
        for( let _part of pathParts )
        {
            // Found
            if( typeof folders[ _part ] !== 'undefined' )
            {
                folder  = folders[ _part ]
                folders = folder.folders
            }

            // Not found
            else
            {
                folder  = null
                folders = null
                break
            }
        }

        // Folder found
        if( folders && folder )
        {
            let file = folder.files[ filePart ]

            if( typeof file !== 'undefined' )
            {
                return file
            }
        }

        return false
    }

    /**
     * Get folder
     * @param {String} _path - Path to folder
     * @returns {Object} Folder
     */
    getFolder( _path )
    {
        // Errors
        if( typeof _path !== 'string' )
        {
            console.warn( 'getFolder: _path should be a string' )
            return false
        }

        // Set up
        let path      = this.cleanPath( _path ),
            pathParts = path.split( '/' ),
            folders   = this.folders,
            folder    = null

        // Each path part
        for( let _part of pathParts )
        {
            // Already exist
            if( typeof folders[ _part ] !== 'undefined' )
            {
                folder  = folders[ _part ]
                folders = folder.folders
            }

            // Folder doesn't exist
            else
            {
                return false
            }
        }

        // Return
        return folder
    }

    /**
     * Browse every folders and remove empty ones
     * @return {Number} Number of removed folders
     */
    removeEmptyFolders()
    {
        // Set up
        let removedCount = 0

        // Recursive remove
        function canRemoveFolder( folder )
        {
            // Each folder inside current folder
            for( let _folderKey in folder.folders )
            {
                // Try to remove folder
                let _folder    = folder.folders[ _folderKey ],
                    canRemove = canRemoveFolder( _folder )

                // Remove folder
                if( canRemove )
                {
                    removedCount++

                    // Delete
                    delete folder.folders[ _folderKey ]

                    // Callback
                    if( typeof _folder.data.onRemove === 'function' )
                    {
                        _folder.data.onRemove.apply( this, [ _folder ] )
                    }
                }
            }

            // Can be removed
            let folderKeys = Object.keys( folder.folders ),
                filesKeys  = Object.keys( folder.files )

            if( folderKeys.length === 0 && folderKeys.length === 0 )
            {
                return true
            }
            else
            {
                return false
            }
        }

        // Try from ./
        canRemoveFolder( this.folders[ '.' ] )

        return removedCount
    }

    /**
     * Describe the tree in ASCII (├ ─ │ └)
     * @param {Boolean} _log - Directly log to console
     * @param {Boolean} _colored - Colored tree (only work well in Chrome)
     * @return {String} Tree
     */
    describe( _log = false, _colored = false )
    {
        // Set up
        let stringTree = '',
            depth       = 0

        function addToString( value, type = null )
        {
            if( _colored )
            {
                switch( type )
                {
                    case 'structure':
                        stringTree += '\x1b[38;5;234m' // #999
                        break

                    case 'folder':
                        stringTree += '\x1b[38;5;246m' // #999
                        break

                    case 'file':
                        stringTree += '\x1b[1m' // #333 bold
                        break

                    default:
                        stringTree += ''
                        break
                }
            }

            stringTree += value

            if( _colored )
            {
                stringTree += '\x1b[0m'
            }
        }

        // Recursive describe
        function describeFolder( folder, depth, last = [] )
        {
            // Set up
            let folderKeys = Object.keys( folder.folders ),
                fileKeys   = Object.keys( folder.files )

            // Each folders
            for( let i = 0; i < folderKeys.length; i++ )
            {
                // Set up
                let _folderKey = folderKeys[ i ],
                    _folder    = folder.folders[ _folderKey ]

                // Add to tree string
                addToString( '\n' )

                for( let j = 0; j < depth; j++ )
                {
                    if( j === depth - 1 )
                    {
                        if( i === folderKeys.length - 1 && fileKeys.length === 0 )
                            addToString( ' └', 'structure' )
                        else
                            addToString( ' ├', 'structure' )
                    }
                    else
                    {
                        if( last[ j ] )
                            addToString( '  ', 'structure' )
                        else
                            addToString( ' │', 'structure' )
                    }
                }

                addToString( '─', 'structure' )
                addToString( _folder.name + '/', 'folder' )

                // Last
                last.push( i === folderKeys.length - 1 && fileKeys.length === 0 )

                // Continue
                describeFolder( _folder, depth + 1, last )
            }

            // Each files
            for( let i = 0; i < fileKeys.length; i++ )
            {
                // Set up
                let _fileKey = fileKeys[ i ],
                    _file     = folder.files[ _fileKey ]

                // Add to tree string
                stringTree += '\n'

                for( let j = 0; j < depth; j++ )
                {
                    if( j === depth - 1 )
                    {
                        if( i === fileKeys.length - 1 )
                            addToString( ' └', 'structure' )
                        else
                            addToString( ' ├', 'structure' )
                    }
                    else
                    {
                        if( last[ j ] )
                            addToString( '  ', 'structure' )
                        else
                            addToString( ' │', 'structure' )
                    }
                }

                addToString( '─', 'structure' )
                addToString( _file.name, 'file' )
            }
        }

        // Describe from ./
        addToString( '.', 'folder' )
        addToString( '/', 'structure' )
        describeFolder( this.folders[ '.' ], depth + 1 )

        // Log
        if( _log )
        {
            console.log( stringTree )
        }

        return stringTree
    }
}



// /**
//  * Tests
//  */
// let tree = new FileTree( { autoWash: false } )

// tree.addFolder( './hey/hoy', { active: false, notifs: 0 } )
// tree.addFolder( './hey/hoy/toto', { active: false, notifs: 0 } )
// tree.addFolder( './hey/hoy/tata', { active: false, notifs: 0 } )

// tree.addFile( './test-1.txt', { active: false, notifs: 0 } )
// tree.addFile( './hey/hoy/test-2.txt', { active: false, notifs: 0 } )
// tree.addFile( './hey/hoy/test-3.txt', { active: false, notifs: 0 } )
// tree.addFile( './hey/hoy/tata/test-4.txt', { active: false, notifs: 0 } )
// tree.addFile( './hey/hoy/toto/test-5.txt', { active: false, notifs: 0 } )

// tree.addFile( './hey/hoy/toto/test-6.txt', { active: false, notifs: 0, onRemove: function( file ){ console.log( 'removed file :', file ); } } )
// tree.removeFile( './hey/hoy/toto/test-6.txt' )

// tree.addFolder( './pwet', { onRemove: function( folder ){ console.log( 'removed folder :', folder ); } } )
// tree.addFolder( './pwet/uh', { onRemove: function( folder ){ console.log( 'removed folder :', folder ); } } )
// tree.removeFolder( './pwet' )

// tree.removeFile( './hey/hoy/test-2.txt' )
// tree.removeFolder( './hey' )

// tree.describe( true, true )

module.exports = FileTree
