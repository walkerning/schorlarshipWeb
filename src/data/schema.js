module.exports = {
  tableNames: ["notices", "groups", "users", "reasons", "reasons_users",
               "honors", "groups_honors", "honors_users", "honor_user_scores",
               "scholars", "groups_scholars", "scholars_users",
               "forms", "fills", "permissions", "permissions_users"],

  notices: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      maxlength: 20,
      nullable: false
    },
    description: {
      type: "text",
      nullable: true
    },
    attachment_name: {
      type: "string",
      maxlength: 30,
      nullable: true
    },
    suffix: {
      type: "string",
      maxlength: 10,
      nullable: true
    },
    attachment_hash: {
      type: "string",
      nullable: true
    },
    // time: {
    //   type: "dateTime",
    //   nullable: false
    // },

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

  users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    group_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      references: "groups.id"
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

  reasons: {
    // FIXME: all `year` attributes should be changed into integer type...
    year: {
      type: "integer",
      unsigned: true,
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      nullable: false,
      maxlength: 20
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

  reasons_users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    user_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      composite_unique: 1,
      references: "users.id",
      onDelete: "CASCADE"
    },
    year: {
      type: "integer",
      nullable: false,
      unsigned: true,
      composite_unique: 1,
      references: "reasons.year",
      onDelete: "CASCADE"
    },
    fill_id: {
      type: "integer",
      nullable: false
    },
    apply_time: {
      type: "datetime",
      nullable: true,
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
    // FIXME: when delete a form with no fill but with honor/scholarship references
    //        maybe should add notice in the front-end.
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
      unsigned: true,
      composite_primary: true,
      references: "groups.id",
      onDelete: "CASCADE"
    },
    honor_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      composite_primary: true,
      references: "honors.id",
      onDelete: "CASCADE"
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
      primary: true
    },
    user_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      composite_unique: 1,
      references: "users.id",
      onDelete: "CASCADE"
    },
    honor_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      composite_unique: 1,
      references: "honors.id",
      onDelete: "CASCADE"
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
      unsigned: true,
      composite_unique: 1,
      references: "honors_users.id",
      onDelete: "CASCADE"
    },
    scorer_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      composite_unique: 1,
      references: "users.id",
      onDelete: "CASCADE"
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
      unsigned: true,
      composite_primary: true,
      references: "groups.id",
      onDelete: "CASCADE"
    },
    scholar_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      composite_primary: true,
      references: "scholars.id",
      onDelete: "CASCADE"
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
      nullable: false,
      unsigned: true,
      references: "users.id",
      onDelete: "CASCADE"
    },
    scholar_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      references: "scholars.id",
      onDelete: "CASCADE"
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
    user_honor_id: {
      type: "integer",
      nullable: true,
      unsigned: true,
      references: "honors_users.id",
      onDelete: "CASCADE"
    },
    user_scholar_id: {
      type: "integer",
      nullable: true,
      unsigned: true,
      references: "scholars_users.id",
      onDelete: "CASCADE"
    },
    form_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      references: "forms.id",
      onDelete: "CASCADE"
    },
    user_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      references: "users.id",
      onDelete: "CASCADE"
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
