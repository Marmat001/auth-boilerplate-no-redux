import React, { useState, useEffect } from 'react'
import {
  isAuthenticated,
  getCookie,
  signOut,
  updateUserInfo,
} from '../components/HelperFunctions'
import axios from 'axios'
import { toast } from 'react-toastify'

import BluePrint from '../components/BluePrint'

const initialState = {
  role: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  buttonText: 'Submit',
}

const AdminPage = ({ history }) => {
  const [userInfo, setUserInfo] = useState(initialState)

  const { role, name, email, password, confirmPassword, buttonText } = userInfo

  const handleChange = (name) => (e) => {
    setUserInfo({ ...userInfo, [name]: e.target.value })
  }
  const token = getCookie('token')

  useEffect(() => {
    loadProfileInfo()
    // eslint-disable-next-line
  }, [])

  const loadProfileInfo = () => {
    axios({
      method: 'GET',
      url: `${process.env.REACT_APP_API}/user/${isAuthenticated()._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => {
        const { role, name, email } = resp.data
        setUserInfo({ ...userInfo, role, name, email })
      })
      .catch((error) => {
        if (error.response.status === 401) {
          signOut(() => {
            history.push('/')
          })
        }
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword)
      return toast.error('Passwords do not match')
    setUserInfo({ ...userInfo, buttonText: 'Submitting' })
    axios({
      method: 'PUT',
      url: `${process.env.REACT_APP_API}/admin/update`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { name, password },
    })
      .then((resp) => {
        updateUserInfo(resp, () => {
          setUserInfo({
            ...userInfo,
            password: '',
            confirmPassword: '',
            buttonText: 'Submitted',
          })
          toast.success('Profile updated successfully!')
        })
      })
      .catch((err) => {
        setUserInfo({ ...userInfo, buttonText: 'Submit' })
        toast.error(err.response.data.error)
      })
  }

  const updateForm = (e) => (
    <form>
      <div className='form-group'>
        <label className='text-muted'>Role</label>
        <input
          defaultValue={role}
          type='text'
          className='form-control'
          disabled
        />
      </div>

      <div className='form-group'>
        <label className='text-muted'>Name</label>
        <input
          onChange={handleChange('name')}
          value={name}
          type='text'
          className='form-control'
        />
      </div>

      <div className='form-group'>
        <label className='text-muted'>Email</label>
        <input
          defaultValue={email}
          type='email'
          className='form-control'
          disabled
        />
      </div>

      <div className='form-group'>
        <label className='text-muted'>Password</label>
        <input
          onChange={handleChange('password')}
          value={password}
          type='password'
          className='form-control'
        />
      </div>

      <div className='form-group'>
        <label className='text-muted'>Confirm Password</label>
        <input
          onChange={handleChange('confirmPassword')}
          value={confirmPassword}
          type='password'
          className='form-control'
        />
      </div>

      <div>
        <button
          disabled={buttonText === 'Submitting'}
          onClick={handleSubmit}
          className='btn btn-primary btn-raised'
        >
          {buttonText}
        </button>
      </div>
    </form>
  )

  return (
    <BluePrint>
      <div className='col-md-6 offset-md-3'>
        <h1 className='p-5 text-center'>Admin Profile Page</h1>
        <h4 className='lead text-center'>Update Profile</h4>
        {updateForm()}
      </div>
    </BluePrint>
  )
}

export default AdminPage
