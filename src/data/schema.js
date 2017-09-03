module.exports = {
  users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    group_id: {
      type: "integer",
      nullable: false
    },
    name: {
      type: "string",
      maxlength: 36,
      nullable: false
    },
    password: {
      type: "string",
      maxlength: 191,
      nullable: false
    },
    student_id: {
      type: "string",
      maxlength: 36,
      nullable: false,
      unique: true
    },
    email: {
      type: "string",
      maxlength: 191,
      nullable: false,
      unique: true,
      validations: {
        isEmail: true
      }
    },
    phone: {
      type: "string",
      maxlength: 20,
      nullable: false,
      unique: true,
      validations: {
        isPhone: true
      }
    },
    class: {
      type: "string",
      maxlength: 36,
      nullable: false
    },
    gpa: {
      type: "float",
      nullable: true,
      validations: {
        isBetween: [0, 100]
      }
    },
    class_rank: {
      type: "integer",
      nullable: true,
      validations: {
        isMinimum: 1
      }
    },
    year_rank: {
      type: "integer",
      nullable: true,
      validations: {
        isMinimum: 1
      }
    },
    active: {
      type: "boolean",
      nullable: false,
      defaultTo: true
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },

    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    },
  },

  groups: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      maxlength: 20,
      nullable: false,
      composite_unique: 1
    },
    type: {
      type: "string",
      maxlength: 36,
      nullable: false,
      validations: {
        isIn: [["undergraduate", "graduate", "faculty"]]
      },
      composite_unique: 1
    },
    description: {
      type: "string",
      maxlength: 54,
      nullable: true
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },
    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    }
  },

  honors: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      maxlength: 50,
      nullable: false,
      composite_unique: 1
    },
    year: {
      type: "string",
      maxlength: 20,
      nullable: false,
      composite_unique: 1
    },
    start_time: {
      type: "datetime",
      nullable: false
    },
    end_time: {
      type: "datetime",
      nullable: false
    },
    form_id: {
      type: "integer",
      nullable: false
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },
    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    }
  },

  groups_honors: {
    // id: {
    //   type: "increments",
    //   nullable: false,
    //   primary: true
    // },
    group_id: {
      type: "integer",
      nullable: false,
      composite_primary: true,
    },
    honor_id: {
      type: "integer",
      nullable: false,
      composite_primary: true
    },
    quota: {
      type: "integer",
      nullable: false,
      validations: {
        isMinimum: 0
      }
    }
  },

  honor_user_scores: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    score: {
      type: "text",
      nullable: true
    },
    honor_user_id: {
      type: "integer",
      nullable: false,
      composite_unique: 1
    },
    scorer_id: {
      type: "integer",
      nullable: false,
      composite_unique: 1
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },

    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    },
  },

  honors_users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    user_id: {
      type: "integer",
      nullable: false,
      composite_unique: 1
    },
    honor_id: {
      type: "integer",
      nullable: false,
      composite_unique: 1
    },
    state: {
      type: "string",
      nullable: false,
      defaultTo: "temp",
      validations: {
        isIn: [["temp", "applied", "success", "fail", "leaveout"]]
      }
    },
    apply_time: {
      type: "datetime",
      nullable: true,
    },
    fill_id: {
      type: "integer",
      nullable: false
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },

    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    }
  },

  scholars: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      maxlength: 50,
      nullable: false,
      composite_unique: 1
    },
    year: {
      type: "string",
      maxlength: 20,
      nullable: false,
      composite_unique: 1
    },
    alloc: {
      type: "string",
      nullable: false,
      defaultTo: "quota",
      validations: {
        isIn: [["quota", "money"]]
      }
    },
    money: {
      type: "integer",
      nullable: true,
      validations: {
        isMinimum: 0
      }
    },
    form_id: {
      type: "integer",
      nullable: false
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },
    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    }
  },

  groups_scholars: {
    //id: {
    //  type: "increments",
    //  nullable: false,
    //  primary: true
    //},
    group_id: {
      type: "integer",
      nullable: false,
      composite_primary: true,
    },
    scholar_id: {
      type: "integer",
      nullable: false,
      composite_primary: true,
    },
    quota: {
      type: "integer",
      nullable: false,
      validations: {
        isMinimum: 0
      }
    }
  },

  scholars_users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    user_id: {
      type: "integer",
      nullable: false
    },
    scholar_id: {
      type: "integer",
      nullable: false
    },
    state: {
      type: "string",
      nullable: false,
      validations: {
        isIn: [["success", "fail"]]
      }
    },
    fill_id: {
      type: "integer",
      nullable: true
    },
    money: {
      type: "integer",
      nullable: true
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },

    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    }
  },

  forms: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      maxlength: 150,
      nullable: false
    },
    type: {
      type: "string",
      nullable: false,
      validations: {
        isIn: [["apply", "thanks"]]
      }
    },
    // maxlength: 65,535 (2**16 − 1)
    fields: {
      type: "text",
      nullable: false
    },
    template: {
      type: "text",
      nullable: true
    },

    // timestamps
    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },

    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    }
  },

  fills: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    form_id: {
      type: "integer",
      nullable: false
    },
    user_id: {
      type: "integer",
      nullable: false
    },
    content: {
      type: "text",
      nullable: false
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },

    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    }
  },

  permissions: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      maxlength: 36,
      nullable: false,
      unique: true
    },
    description: {
      type: "string",
      maxlength: 150,
      nullable: false
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    created_by: {
      type: "integer",
      nullable: false
    },
    updated_at: {
      type: "dateTime",
      nullable: true
    },
    updated_by: {
      type: "integer",
      nullable: true
    }
  },

  permissions_users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    user_id: {
      type: "integer",
      nullable: false
    },
    permission_id: {
      type: "integer",
      nullable: false
    }
  }
};
