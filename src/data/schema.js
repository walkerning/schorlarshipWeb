module.exports = {
  users: {
    id: {
      type: "increments",
      nullable: false,
      primarty: true
    },
    group_id: {
      type: "integer",
      nullable: false
    },
    type: {
      type: "string",
      maxlength: 36,
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
      nullable: true,
      unique: true,
      validations: {
        isPhone: true
      }
    },
    class: {
      type: "string",
      maxlength: 36,
      nullable: true
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
      primarty: true
    },
    name: {
      type: "string",
      maxlength: 20,
      nullable: false,
      unique: true
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
      primarty: true
    },
    name: {
      type: "string",
      maxlength: 50,
      nullable: false
    },
    year: {
      type: "string",
      maxlength: 20,
      nullable: false
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
    id: {
      type: "increments",
      nullable: false,
      primarty: true
    },
    group_id: {
      type: "integer",
      nullable: false
    },
    honor_id: {
      type: "integer",
      nullable: false
    },
    quota: {
      type: "integer",
      nullable: false,
      validations: {
        isMinimum: 0
      }
    }
  },

  honors_users: {
    id: {
      type: "increments",
      nullable: false,
      primarty: true
    },
    user_id: {
      type: "integer",
      nullable: false
    },
    honor_id: {
      type: "integer",
      nullable: false
    },
    state: {
      type: "string",
      nullable: false,
      validations: {
        isIn: [["applied", "success", "fail"]]
      }
    },
    score: {
      type: "integer",
      nullable: false,
      defaultTo: -1
    },
    fill_id: {
      type: "integer",
      nullable: false
    }
  },

  scholars: {
    id: {
      type: "increments",
      nullable: false,
      primarty: true
    },
    name: {
      type: "string",
      maxlength: 50,
      nullable: false
    },
    year: {
      type: "string",
      maxlength: 20,
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

  scholars_users: {
    id: {
      type: "increments",
      nullable: false,
      primarty: true
    },
    user_id: {
      type: "integer",
      nullable: false
    },
    honor_id: {
      type: "integer",
      nullable: false
    },
    fill_id: {
      type: "integer",
      nullable: false
    }
  },

  forms: {
    id: {
      type: "increments",
      nullable: false,
      primarty: true
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
    }
  },

  fills: {
    id: {
      type: "increments",
      nullable: false,
      primarty: true
    },
    form_id: {
      type: "integer",
      nullable: false
    },
    content: {
      type: "text",
      nullable: false
    }
  },

  permissions: {
    id: {
      type: "increments",
      nullable: false,
      primarty: true
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
      primarty: true
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
