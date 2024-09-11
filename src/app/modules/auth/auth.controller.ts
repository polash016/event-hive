/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import { authServices } from './auth.service'
import sendResponse from '../../../shared/sendResponse'

interface GLoginRes {
  accessToken: string
  refreshToken: string
}

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body)

  const { refreshToken, ...other } = result

  res.cookie('refreshToken', refreshToken, {
    secure: false, // true only in production
    httpOnly: true,
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully!',
    data: other,
  })
})

const googleCallback = catchAsync(async (req, res) => {
  if (req.user) {
    const { refreshToken } = req.user as GLoginRes

    res.cookie('refreshToken', refreshToken, {
      secure: false, // true only in production
      httpOnly: true,
    })
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User logged in successfully!',
      data: req.user,
    })
  } else {
    res.status(403).json({ error: true, message: 'Not Authorized' })
  }
  // const user = req?.user

  // console.log('controller', user)

  // // const result = await authServices.findOrCreateUser(user)

  // // Handle the user object, e.g., create a session or return a JWT
  // // res.redirect('/') // Redirect to your desired route after successful login

  // sendResponse(res, {
  //   statusCode: httpStatus.OK,
  //   success: true,
  //   message: 'User logged in successfully!',
  //   data: user,
  // })
})

const refreshToken = catchAsync(async (req, res) => {
  // console.log(req);
  const { refreshToken } = req.cookies

  const result = await authServices.refreshToken(refreshToken)

  // const { accessToken } = result

  // res.cookie('refreshToken', accessToken, {
  //   secure: false, // true only in production
  //   httpOnly: true,
  // })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token generated successfully!',
    data: result,
  })
})

const changePassword = catchAsync(async (req, res) => {
  if (req.user) {
    await authServices.changePassword((req.user as any).email, req.body)
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully!',
    data: null,
  })
})

const forgotPassword = catchAsync(async (req, res) => {
  await authServices.forgotPassword(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check your mail!',
    data: null,
  })
})

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization || ''

  await authServices.resetPassword(token, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully!',
    data: null,
  })
})

export const authController = {
  loginUser,
  googleCallback,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
}
