/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import { authServices } from './auth.service'
import sendResponse from '../../../shared/sendResponse'

interface GLoginRes {
  googleId: string
  accessToken: string
  refreshToken: string
}

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body)

  const { refreshToken, ...other } = result

  res.cookie('refreshToken', refreshToken, {
    secure: process.env.NODE_ENV === 'production' ? true : false, // true in production
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
    const { accessToken, refreshToken } = req.user as GLoginRes

    // Set a secure HTTP-only cookie with the token
    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      httpOnly: true,
    })

    // Redirect to the frontend with additional user data in query params
    res.redirect(
      `https://event-hive-client.vercel.app/login/success?accessToken=${accessToken}`,
    )
  } else {
    // If authentication fails, redirect to the login page with an error message
    res.redirect(`https://event-hive-client.vercel.app/login`)
  }
})

// const googleCallback = catchAsync(async (req, res) => {
//   if (req.user) {
//     const { refreshToken } = req.user as GLoginRes

//     res.cookie('refreshToken', refreshToken, {
//       secure: false, // true only in production
//       httpOnly: true,
//     })
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'User logged in successfully!',
//       data: req.user,
//     })
//   } else {
//     sendResponse(res, {
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       success: false,
//       message: 'Not authorized',
//       data: null,
//     })
//   }
//   // const user = req?.user

//   // console.log('controller', user)

//   // // const result = await authServices.findOrCreateUser(user)

//   // // Handle the user object, e.g., create a session or return a JWT
//   // // res.redirect('/') // Redirect to your desired route after successful login

//   // sendResponse(res, {
//   //   statusCode: httpStatus.OK,
//   //   success: true,
//   //   message: 'User logged in successfully!',
//   //   data: user,
//   // })
// })

const refreshToken = catchAsync(async (req, res) => {
  // console.log(req);
  const { refreshToken } = req.cookies
  console.log(refreshToken)

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
