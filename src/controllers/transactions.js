const transactionModels = require("../models/transactions");
// const userModels = require("../models/users")
const { v4: uuid } = require("uuid");
const path = require('path')

const history = async (req, res, next) => {
  try {

    const { userId } = req.params;
    const response = await transactionModels.history(userId)
    console.log(userId)
    if (response) {
      res.status(200);
      res.json({
        data: response,
      });
    } else {
      res.status(404);
      res.json({
        message: "Data not found",
      });
    }
  } catch (error) {
    console.log(error.response)
    next(new Error(error.response));
  }
};

const transaction = async (req, res, next) => {
  try {
    const { idUserTransfer, idUserTopup, amount, description } = req.body
    const status = "success"

    if (!idUserTransfer) return res.status(400).send({ message: "idUserTransfer cannot be null" })
    if (!idUserTopup) return res.status(400).send({ message: "idUserTransfer cannot be null" })
    if (!amount) return res.status(400).send({ message: "amount cannot be null" })
    if (!description) return res.status(400).send({ message: "description cannot be null" })

    const data = {
      id: uuid().split("-").join(""),
      idUserTransfer,
      idUserTopup,
      amount,
      description,
      status
    }

    const userTransfer = await userModels.getUsersById(idUserTransfer)
    const userTopup = await userModels.getUsersById(idUserTopup)

    const response = await transactionModels.transaction(data)

    let amountUserTransfer = userTransfer.amount
    let amountuserTopup = userTopup.amount

    amountUserTransfer = amountUserTransfer - amount
    amountuserTopup = amountuserTopup + amount

    const upadateUserTransfer = {
      amount: amountUserTransfer,
      upadatedAt: new Date()
    }

    const upadateUserTopup = {
      amount: amountuserTopup,
      upadatedAt: new Date()
    }

    await userModels.updateUser(idUserTransfer, upadateUserTransfer)
    await userModels.updateUser(idUserTopup, upadateUserTopup)

    response.info = "Transfer Success"
    data.message = response.info
    data.status = true
    data.balanceLeft = amountUserTransfer
    res.json({
      data
    });
  } catch (error) {
    next(new Error(error.message));
  }
}

const detailTransaction = async (req, res, next) => {
  try {
    const { id } = req.params

    const response = await transactionModels.detailTransaction(id)

    if (response.length) {
      res.status(200)
       res.json({
         data: response
       });
    } else {
      res.status(404).send({ message: "Data not found" });
    }
  } catch (error) {
    next(new Error(error.message))
  }
}

const topup = async (req, res, next) => {
  try {
    const { callback_virtual_account_id, amount } = req.body

    // get data from topup table where id = callback_virtual_account_id

    // get user where id = userid from table topup

    // update amount user + amount topup
  } catch (error) {
    next(new Error(error.message))    
  }
}

module.exports = {
  history,
  transaction,
  detailTransaction,
  topup
};