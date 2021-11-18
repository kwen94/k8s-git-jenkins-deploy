import store from 'store'


const USER_KEY = 'user_key'

export default {
    saveUser (user) {
        store.set(USER_KEY, user)
    },

    getUser () {
        return store.get(USER_KEY) || {}
    },

    removeUser () {
        store.remove(USER_KEY)
    }
}


const COLLAPSED = "collapsed"

export const collapsedStorage = {
    saveCollapsed (status){
        store.set(COLLAPSED, status)
    },

    getCollapsed (){
        return store.get(COLLAPSED) || false
    },
}