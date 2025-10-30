//这是一个同步的action
export const INCREASE = 'INCREASE'

export const increase = {
  type: INCREASE,
}

export const addCountAsync = () => {
  return (dispatch) => {
    setTimeout(() => {
      dispatch({ type: 'GET_DATA' })
    }, 2000)
  }
}

// 设置当前角色
export const SET_ROLE = 'SET_ROLE'
export const setRole = (role) => ({
  type: SET_ROLE,
  payload: role,
})
